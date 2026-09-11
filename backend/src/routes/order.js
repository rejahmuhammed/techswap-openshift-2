require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, param, validationResult } = require('express-validator');

// Validation helper
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get current user's orders
router.get(
  '/',
  async (req, res) => {
    try {
      const userId = req.user ? req.user.userId : null;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await pool.query(
        `SELECT o.id, o.total_amount, o.status, o.payment_status, o.created_at,
          json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single order
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.userId : null;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get order with items
      const orderResult = await pool.query(
        `SELECT o.id, o.user_id, o.total_amount, o.status, o.payment_status, o.created_at,
          json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = $1
        GROUP BY o.id`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization - user must be the order owner or admin
      if (orderResult.rows[0].user_id !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden. Access denied.' });
      }

      res.json(orderResult.rows[0]);
    } catch (err) {
      console.error('Error fetching order:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create order from cart
router.post(
  '/from-cart',
  [
    body('items')
      .isArray({ min: 1 }).withMessage('Must have at least one item'),
    body('items.*.product_id').isUUID().withMessage('Valid product ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('payment_method').optional().isString(),
  ],
  runValidation,
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { items, total_amount, payment_method } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await client.query('BEGIN');

      // Check stock and calculate total
      let calculatedTotal = 0;

      for (const item of items) {
        const productResult = await client.query(
          'SELECT id, name, price, condition, stock FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Product ${item.product_id} not found` });
        }

        const product = productResult.rows[0];

        if (product.condition !== 'NEW' && product.stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        if (product.stock > 0) {
          // Reserve stock
          await client.query(
            'UPDATE products SET stock = stock - $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        calculatedTotal += product.price * item.quantity;
      }

      if (Math.abs(calculatedTotal - total_amount) > 0.01) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Total amount mismatch' });
      }

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_amount, status, payment_status)
         VALUES ($1, $2, 'PENDING', 'PENDING')
         RETURNING id, user_id, total_amount, status, payment_status, created_at`,
        [userId, total_amount]
      );

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');

      // TODO: In production, trigger serverless order.created event here
      // e.g., publish to a message queue, call Knative function, etc.

      res.status(201).json({
        message: 'Order created successfully from cart',
        order: {
          id: orderId,
          userId,
          total_amount,
          status: 'PENDING',
          payment_status: 'PENDING',
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating order from cart:', err);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
);

// Update order status (admin only)
router.patch(
  '/:id/status',
  [
    param('id').isUUID().withMessage('Order ID must be a valid UUID'),
    body('status')
      .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
      .withMessage('Invalid order status'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        message: 'Order status updated successfully',
        order: result.rows[0],
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Cancel order
router.patch(
  '/:id/cancel',
  [
    param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check authorization
      const orderResult = await pool.query(
        'SELECT user_id FROM orders WHERE id = $1',
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (orderResult.rows[0].user_id !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden. Access denied.' });
      }

      // Restore stock when cancelling
      const orderItemsResult = await pool.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );

      await client.query('BEGIN');

      for (const item of orderItemsResult.rows) {
        await pool.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      const result = await pool.query(
        'UPDATE orders SET status = $1, payment_status = $2 WHERE id = $3 RETURNING *',
        ['CANCELLED', 'REFUNDED', id]
      );

      await client.query('COMMIT');

      res.json({
        message: 'Order cancelled successfully',
        order: result.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error cancelling order:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
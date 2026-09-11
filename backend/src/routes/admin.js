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

// Get all users (admin only)
router.get(
  '/users',
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all products (admin only)
router.get(
  '/products',
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, description, category_id, brand, model, price, condition, stock, seller_id, location, image_url, created_at, updated_at FROM products ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update user role (admin only)
router.put(
  '/users/:id/role',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('role').isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, updated_at',
        [role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User role updated successfully',
        user: result.rows[0],
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete user (admin only) - soft delete by setting role or hard delete
router.delete(
  '/users/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all orders (admin only)
router.get(
  '/orders',
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT o.id, o.user_id, o.total_amount, o.status, o.payment_status, o.created_at, o.updated_at,
          u.name as user_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all reviews (admin only)
router.get(
  '/reviews',
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
          u.name as user_name,
          p.name as product_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN products p ON r.product_id = p.id
         ORDER BY r.created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
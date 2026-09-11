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

// Get all shops
router.get(
  '/',
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, address, latitude, longitude, rating, phone, categories, created_at FROM shops ORDER BY rating DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching shops:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single shop
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Shop ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, name, address, latitude, longitude, rating, phone, categories, created_at FROM shops WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching shop:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Create shop (admin only)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Shop name is required').isLength({ max: 200 }),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('latitude').isDecimal().withMessage('Latitude must be a valid decimal'),
    body('longitude').isDecimal().withMessage('Longitude must be a valid decimal'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('categories').optional().isArray().withMessage('Categories must be an array'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { name, address, latitude, longitude, phone, categories } = req.body;

      const result = await pool.query(
        `INSERT INTO shops (name, address, latitude, longitude, phone, categories, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, name, address, latitude, longitude, rating, phone, categories, created_at`,
        [name, address, latitude, longitude, phone || null, categories || []]
      );

      res.status(201).json({
        message: 'Shop created successfully',
        shop: result.rows[0],
      });
    } catch (err) {
      console.error('Error creating shop:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update shop (admin only)
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Shop ID must be a valid UUID'),
    body('name').optional().trim().notEmpty().withMessage('Shop name cannot be empty').isLength({ max: 200 }),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    body('latitude').optional().isDecimal().withMessage('Latitude must be a valid decimal'),
    body('longitude').optional().isDecimal().withMessage('Longitude must be a valid decimal'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('categories').optional().isArray(),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      const setClauses = [];
      const queryParams = [];
      let paramCount = 0;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${++paramCount}`);
        queryParams.push(updates.name);
      }
      if (updates.address !== undefined) {
        setClauses.push(`address = $${++paramCount}`);
        queryParams.push(updates.address);
      }
      if (updates.latitude !== undefined) {
        setClauses.push(`latitude = $${++paramCount}`);
        queryParams.push(updates.latitude);
      }
      if (updates.longitude !== undefined) {
        setClauses.push(`longitude = $${++paramCount}`);
        queryParams.push(updates.longitude);
      }
      if (updates.phone !== undefined) {
        setClauses.push(`phone = $${++paramCount}`);
        queryParams.push(updates.phone);
      }
      if (updates.categories !== undefined) {
        setClauses.push(`categories = $${++paramCount}`);
        queryParams.push(updates.categories);
      }

      setClauses.push(`updated_at = NOW()`);
      queryParams.push(id);

      const query = `
        UPDATE shops
        SET ${setClauses.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING id, name, address, latitude, longitude, rating, phone, categories, updated_at
      `;

      const result = await pool.query(query, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      res.json({
        message: 'Shop updated successfully',
        shop: result.rows[0],
      });
    } catch (err) {
      console.error('Error updating shop:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete shop (admin only)
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Shop ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM shops WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      res.json({ message: 'Shop deleted successfully' });
    } catch (err) {
      console.error('Error deleting shop:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
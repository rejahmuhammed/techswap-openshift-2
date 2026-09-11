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
  '/',
  [
    // Auth middleware would verify admin role in full implementation
  ],
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

// Get single user
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update user profile
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
    body('phone').optional().trim().isLength({ max: 20 }),
    body('location').optional().trim().isLength({ max: 255 }),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { name, phone, location } = req.body;
      const userId = req.user ? req.user.userId : null;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const setClauses = [];
      const queryParams = [];
      let paramCount = 0;

      if (name !== undefined) {
        setClauses.push(`name = $${++paramCount}`);
        queryParams.push(name);
      }
      if (phone !== undefined) {
        setClauses.push(`phone = $${++paramCount}`);
        queryParams.push(phone);
      }
      if (location !== undefined) {
        setClauses.push(`location = $${++paramCount}`);
        queryParams.push(location);
      }

      setClauses.push(`updated_at = NOW()`);
      queryParams.push(userId);

      const query = `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE id = $${++paramCount}
        RETURNING id, name, email, phone, role, created_at, updated_at
      `;

      const result = await pool.query(query, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0],
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
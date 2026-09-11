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

// Create review
router.post(
  '/',
  [
    body('user_id').isUUID().withMessage('Invalid user ID'),
    body('product_id').optional().isUUID().withMessage('Invalid product ID'),
    body('technician_id').optional().isUUID().withMessage('Invalid technician ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { user_id, product_id, technician_id, rating, comment } = req.body;

      // Validate that either product_id or technician_id is provided
      if (!product_id && !technician_id) {
        return res.status(400).json({ error: 'Either product_id or technician_id must be provided' });
      }

      // Check for duplicate review
      const existingReview = await pool.query(
        `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
        [user_id, product_id || null]
      );

      if (existingReview.rows.length > 0) {
        return res.status(409).json({ error: 'You have already reviewed this product' });
      }

      const result = await pool.query(
        `INSERT INTO reviews (user_id, product_id, technician_id, rating, comment, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, user_id, product_id, technician_id, rating, comment, created_at`,
        [user_id, product_id || null, technician_id || null, rating, comment]
      );

      res.status(201).json({
        message: 'Review created successfully',
        review: result.rows[0],
      });
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get reviews for a product
router.get(
  '/product/:productId',
  [
    param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await pool.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
          u.name as user_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = $1
         ORDER BY r.created_at DESC`,
        [productId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get reviews for a technician
router.get(
  '/technician/:technicianId',
  [
    param('technicianId').isUUID().withMessage('Technician ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { technicianId } = req.params;
      const result = await pool.query(
        `SELECT r.id, r.rating, r.comment, r.created_at,
          u.name as user_name
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.technician_id = $1
         ORDER BY r.created_at DESC`,
        [technicianId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching technician reviews:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
// Get all products with pagination, search, and filter
router.get(
  '/',
  [
    // Pagination
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    // Search
    query('search').optional().isString().isLength({ min: 1 }).withMessage('Search must be a non-empty string'),
    query('category').optional().isString().withMessage('Category must be a valid string'),
    query('brand').optional().isString().withMessage('Brand must be a valid string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    query('condition').optional().isIn(['NEW', 'PRE_OWNED', 'USED']).withMessage('Condition must be NEW, PRE_OWNED, or USED'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Build WHERE clause dynamically
      const whereConditions = [];
      const queryParams = [];
      let paramCount = 1;
      
      // Search term - match against name and description
      if (req.query.search) {
        whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
        queryParams.push(`%${req.query.search}%`);
        paramCount++;
      }
      
      // Category filter
      if (req.query.category) {
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(req.query.category);
        paramCount++;
      }
      
      // Brand filter
      if (req.query.brand) {
        whereConditions.push(`brand = $${paramCount}`);
        queryParams.push(req.query.brand);
        paramCount++;
      }
      
      // Price range
      if (req.query.minPrice !== undefined) {
        whereConditions.push(`price >= $${paramCount}`);
        queryParams.push(parseFloat(req.query.minPrice));
        paramCount++;
      }
      if (req.query.maxPrice !== undefined) {
        whereConditions.push(`price <= $${paramCount}`);
        queryParams.push(parseFloat(req.query.maxPrice));
        paramCount++;
      }
      
      // Condition filter
      if (req.query.condition) {
        whereConditions.push(`condition = $${paramCount}`);
        queryParams.push(req.query.condition);
        paramCount++;
      }
      
      // Build the WHERE clause
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Count total matching products
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM products ${whereClause}`,
        queryParams
      );
      const total = countResult.rows[0].total;
      
      // Get products with pagination
      const productsResult = await pool.query(
        `SELECT id, name, brand, price, condition, stock, seller_id, created_at, description 
         FROM products ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT $${paramCount} OFFSET ${offset}`,
        [...queryParams, limit]
      );
      
      const products = productsResult.rows;
      
      res.json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        filters: {
          search: req.query.search || '',
          category: req.query.category || '',
          brand: req.query.brand || '',
          minPrice: req.query.minPrice || '',
          maxPrice: req.query.maxPrice || '',
          condition: req.query.condition || '',
        }
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single product by ID
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Product ID must be a valid UUID'),
  ],
  runValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT id, name, brand, price, condition, stock, seller_id, created_at, description FROM products WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Search products (alias for main list with search param)
router.get(
  '/search',
  [
    query('search').optional().isString().isLength({ min: 1 }).withMessage('Search must be a non-empty string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().withMessage('Category must be a valid string'),
    query('brand').optional().isString().withMessage('Brand must be a valid string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    query('condition').optional().isIn(['NEW', 'PRE_OWNED', 'USED']).withMessage('Condition must be NEW, PRE_OWNED, or USED'),
  ],
  runValidation,
  async (req, res) => {
    // Use the main list handler with search param
    // We need to forward the request to the main handler
    // For now, just call the main handler logic inline
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      const whereConditions = [];
      const queryParams = [];
      let paramCount = 1;
      
      if (req.query.search) {
        whereConditions.push(`(name ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
        queryParams.push(`%${req.query.search}%`);
        paramCount++;
      }
      
      if (req.query.category) {
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(req.query.category);
        paramCount++;
      }
      
      if (req.query.brand) {
        whereConditions.push(`brand = $${paramCount}`);
        queryParams.push(req.query.brand);
        paramCount++;
      }
      
      if (req.query.minPrice !== undefined) {
        whereConditions.push(`price >= $${paramCount}`);
        queryParams.push(parseFloat(req.query.minPrice));
        paramCount++;
      }
      if (req.query.maxPrice !== undefined) {
        whereConditions.push(`price <= $${paramCount}`);
        queryParams.push(parseFloat(req.query.maxPrice));
        paramCount++;
      }
      
      if (req.query.condition) {
        whereConditions.push(`condition = $${paramCount}`);
        queryParams.push(req.query.condition);
        paramCount++;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM products ${whereClause}`,
        queryParams
      );
      const total = countResult.rows[0].total;
      
      const productsResult = await pool.query(
        `SELECT id, name, brand, price, condition, stock, seller_id, created_at, description 
         FROM products ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT $${paramCount} OFFSET ${offset}`,
        [...queryParams, limit]
      );
      
      const products = productsResult.rows;
      
      res.json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        filters: {
          search: req.query.search || '',
          category: req.query.category || '',
          brand: req.query.brand || '',
          minPrice: req.query.minPrice || '',
          maxPrice: req.query.maxPrice || '',
          condition: req.query.condition || '',
        }
      });
    } catch (err) {
      console.error('Error searching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
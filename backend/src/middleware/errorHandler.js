require('dotenv').config();

// Centralized error handler for TechSwap backend
// Must be placed after all other middleware and route definitions

module.exports = (err, req, res, next) => {
  // Log error details (never expose to client)
  console.error('Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🫥' : err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Base error response - never expose sensitive info in production
  const errorResponse = {
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { message: err.message })
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};
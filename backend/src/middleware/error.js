const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Don't expose sensitive information in production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  // Don't expose stack traces unless in development
  const stackTrace = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  res.status(statusCode).json({
    error: errorMessage,
    ...(stackTrace && { stack: stackTrace })
  });
};

module.exports = { notFoundHandler, errorHandler };
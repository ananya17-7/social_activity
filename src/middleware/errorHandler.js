const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  console.error('Error:', { status, message, error: err });

  // Validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  // Cast errors (invalid MongoDB ID)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;

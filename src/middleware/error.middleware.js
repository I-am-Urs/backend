export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: true, message: 'Not found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err); // Do not log sensitive data
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ error: true, message: err.message || 'Internal server error' });
};


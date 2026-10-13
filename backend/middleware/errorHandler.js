const { error } = require('../utils/apiResponse');

function notFound(req, res, next) {
  return error(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}


function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error('❌', err);
  }

  return error(res, {
    statusCode,
    message: err.message || 'Internal server error',
    errors: process.env.NODE_ENV !== 'production' ? { stack: err.stack } : null,
  });
}

module.exports = { notFound, errorHandler };

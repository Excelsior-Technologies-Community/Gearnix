/**
 * Wraps an async route handler so any error it throws (or any rejected
 * promise) is automatically forwarded to Express's error handler via next().
 *
 * Without this, every controller would need its own try/catch. With it, we
 * write clean `async (req, res) => { ... }` and let errorHandler.js format
 * the response.
 */
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

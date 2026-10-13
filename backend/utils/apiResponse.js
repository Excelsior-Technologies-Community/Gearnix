/**
 * Small helpers for consistent JSON responses across every controller.
 * Keeps the shape predictable for the frontend: { success, message, data }.
 */

function success(res, { statusCode = 200, message = 'OK', data = null } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

function error(res, { statusCode = 500, message = 'Something went wrong', errors = null } = {}) {
  return res.status(statusCode).json({ success: false, message, errors });
}

module.exports = { success, error };

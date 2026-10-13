const { verifyAuthToken } = require('../utils/jwt');
const { error } = require('../utils/apiResponse');

/**
 * Protects routes. Reads the "Authorization: Bearer <token>" header,
 * verifies the JWT, and attaches { id, role } to req.user so downstream
 * controllers know who is making the request. Any route placed after this
 * middleware requires a valid login.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return error(res, { statusCode: 401, message: 'Authentication required' });
  }

  try {
    const decoded = verifyAuthToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return error(res, { statusCode: 401, message: 'Invalid or expired token' });
  }
}

/**
 * authorizeRoles('Super Admin', 'Product Editor', …)
 * Allows the request only if the logged-in user's role is in the given list.
 * Must be placed AFTER `authenticate` (it relies on req.user.role).
 *
 * Returns a middleware function so each route can specify its own allowed
 * roles, e.g. router.get('/x', authenticate, authorizeRoles('Super Admin'), handler).
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, { statusCode: 401, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, { statusCode: 403, message: 'You do not have access to this resource' });
    }
    return next();
  };
}

/**
 * requireAdmin — allows any staff account (any role that is NOT a plain
 * Customer). Use this to gate the admin panel generally; use authorizeRoles
 * for finer, Super-Admin-only actions. In Step 22 this is complemented by a
 * permission middleware that checks module + action.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return error(res, { statusCode: 401, message: 'Authentication required' });
  }
  if (!req.user.role || req.user.role === 'Customer') {
    return error(res, { statusCode: 403, message: 'Admin access only' });
  }
  return next();
}

module.exports = { authenticate, authorizeRoles, requireAdmin };

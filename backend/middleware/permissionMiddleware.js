const { error } = require('../utils/apiResponse');
const rbacService = require('../services/rbacService');

/**
 * requirePermission('Products', 'delete')
 * Backend enforcement of RBAC (the brief's "backend permission validation").
 * Must be placed after `authenticate`. The Super Admin bypasses all checks;
 * every other staff account must have the (module, action) permission on its
 * role, or the request is rejected with 403 — even if the UI hid the button.
 */
function requirePermission(module, action) {
  return async (req, res, next) => {
    try {
      if (!req.user) return error(res, { statusCode: 401, message: 'Authentication required' });
      if (req.user.role === 'Super Admin') return next();
      if (!req.user.role || req.user.role === 'Customer') {
        return error(res, { statusCode: 403, message: 'Admin access only' });
      }
      const perms = await rbacService.getUserPermissions(req.user.id);
      const allowed = perms.some((p) => p.module === module && p.action === action);
      if (!allowed) {
        return error(res, { statusCode: 403, message: `Missing permission: ${module} / ${action}` });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requirePermission };

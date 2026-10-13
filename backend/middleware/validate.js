const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

/**
 * Runs after a route's express-validator rules. If any rule failed, it stops
 * the request with a 422 and a clean list of { field, message } errors.
 * Otherwise it calls next() and the real controller runs.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = validate;

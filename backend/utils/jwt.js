const jwt = require('jsonwebtoken');

/**
 * JWT helpers. Two separate secrets are used:
 *  - JWT_SECRET       → normal login tokens (long-lived, e.g. 7 days)
 *  - JWT_RESET_SECRET → password-reset tokens (short-lived, e.g. 15 min)
 *
 * Using a different secret for reset tokens means a leaked/expired reset
 * link can never be used as a login token, and vice versa.
 */

function signAuthToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function signResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_RESET_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  });
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.JWT_RESET_SECRET);
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
  signResetToken,
  verifyResetToken,
};

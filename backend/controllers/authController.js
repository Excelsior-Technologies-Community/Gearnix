const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const authService = require('../services/authService');
const {
  signAuthToken,
  signResetToken,
  verifyResetToken,
} = require('../utils/jwt');
const rbacService = require('../services/rbacService');

const SALT_ROUNDS = 10;


const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await authService.getUserByEmail(email);
  if (existing) {
    return error(res, { statusCode: 409, message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await authService.registerUser({ name, email, phone, passwordHash });
  const token = signAuthToken({ id: user.id, role: user.role });

  return success(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user, token },
  });
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getUserByEmail(email);
  if (!user) {
    return error(res, { statusCode: 401, message: 'Invalid email or password' });
  }
  if (user.status !== 'active') {
    return error(res, { statusCode: 403, message: 'Your account is inactive' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return error(res, { statusCode: 401, message: 'Invalid email or password' });
  }

  const { password_hash, ...safeUser } = user;
  const token = signAuthToken({ id: user.id, role: user.role });

  return success(res, {
    message: 'Login successful',
    data: { user: safeUser, token },
  });
});


const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getUserByEmail(email);
  if (!user) {
    return error(res, { statusCode: 401, message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return error(res, { statusCode: 401, message: 'Invalid email or password' });
  }

  if (!user.role || user.role === 'Customer') {
    return error(res, { statusCode: 403, message: 'This account is not an admin account' });
  }
  if (user.status !== 'active') {
    return error(res, { statusCode: 403, message: 'Your account is inactive' });
  }

  const { password_hash, ...safeUser } = user;
  safeUser.permissions = await rbacService.getUserPermissions(user.id);
  const token = signAuthToken({ id: user.id, role: user.role });

  return success(res, {
    message: 'Admin login successful',
    data: { user: safeUser, token },
  });
});


const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  if (!user) {
    return error(res, { statusCode: 404, message: 'User not found' });
  }
  return success(res, { message: 'Profile fetched', data: { user } });
});


const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await authService.updateProfile(req.user.id, { name, phone });
  return success(res, { message: 'Profile updated', data: { user } });
});


const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const profile = await authService.getUserById(req.user.id);
  const full = profile && (await authService.getUserByEmail(profile.email));
  if (!full) {
    return error(res, { statusCode: 404, message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(currentPassword, full.password_hash);
  if (!isMatch) {
    return error(res, { statusCode: 400, message: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await authService.updatePassword(req.user.id, passwordHash);
  return success(res, { message: 'Password changed successfully' });
});


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await authService.getUserByEmail(email);

  const data = {};
  if (user) {
    const resetToken = signResetToken({ id: user.id });
    if (process.env.NODE_ENV !== 'production') {
      data.resetToken = resetToken;
    }
  }

  return success(res, {
    message: 'If that email is registered, a password reset link has been sent',
    data,
  });
});


const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch (err) {
    return error(res, { statusCode: 400, message: 'Reset link is invalid or expired' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await authService.updatePassword(decoded.id, passwordHash);

  return success(res, { message: 'Password reset successful. You can now log in.' });
});

module.exports = {
  register,
  login,
  adminLogin,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};

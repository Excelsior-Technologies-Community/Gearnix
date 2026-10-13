const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const rbacService = require('../services/rbacService');
const userService = require('../services/userService');
const authService = require('../services/authService');

const SALT_ROUNDS = 10;

// ─── Roles & permissions ────────────────────────────────────
const getRoles = asyncHandler(async (req, res) =>
  success(res, { message: 'Roles', data: { roles: await rbacService.getRoles() } }));

const getPermissions = asyncHandler(async (req, res) =>
  success(res, { message: 'Permissions', data: { permissions: await rbacService.getPermissions() } }));

const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissionIds = [] } = req.body;
  try {
    const role = await rbacService.createRole(name, description);
    if (permissionIds.length) await rbacService.setRolePermissions(role.id, permissionIds);
    return success(res, { statusCode: 201, message: 'Role created', data: { role } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, { statusCode: 409, message: 'Role name already exists' });
    throw err;
  }
});

const deleteRole = asyncHandler(async (req, res) => {
  await rbacService.deleteRole(req.params.id);
  return success(res, { message: 'Role deleted' });
});

const getRolePermissions = asyncHandler(async (req, res) =>
  success(res, { message: 'Role permissions', data: { permissions: await rbacService.getRolePermissions(req.params.id) } }));

const setRolePermissions = asyncHandler(async (req, res) => {
  await rbacService.setRolePermissions(req.params.id, req.body.permissionIds || []);
  return success(res, { message: 'Permissions updated' });
});

// ─── Admins / sub-admins ────────────────────────────────────
const getAdmins = asyncHandler(async (req, res) =>
  success(res, { message: 'Admins', data: { admins: await rbacService.getAdmins() } }));

const createSubAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password, roleId } = req.body;
  const existing = await authService.getUserByEmail(email);
  if (existing) return error(res, { statusCode: 409, message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [rows] = await require('../config/db').pool.query('CALL sp_AddUser(?, ?, ?, ?, ?, ?)', [
    name, email, phone || null, passwordHash, roleId, 'active',
  ]);
  return success(res, { statusCode: 201, message: 'Sub-admin created', data: { admin: rows[0][0] } });
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { name, phone, roleId, status } = req.body;
  const admin = await userService.updateUser(req.params.id, { name, phone, roleId, status });
  return success(res, { message: 'Admin updated', data: { admin } });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  if (String(req.user.id) === String(req.params.id)) {
    return error(res, { statusCode: 400, message: 'You cannot delete your own account' });
  }
  await userService.deleteUser(req.params.id);
  return success(res, { message: 'Admin deleted' });
});

module.exports = {
  getRoles, getPermissions, createRole, deleteRole, getRolePermissions, setRolePermissions,
  getAdmins, createSubAdmin, updateAdmin, deleteAdmin,
};

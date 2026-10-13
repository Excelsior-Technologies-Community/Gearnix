const { pool } = require('../config/db');

async function getPermissions() {
  const [r] = await pool.query('CALL sp_GetPermissions()');
  return r[0];
}
async function getRoles() {
  const [r] = await pool.query('CALL sp_GetRoles()');
  return r[0];
}
async function createRole(name, description) {
  const [r] = await pool.query('CALL sp_CreateRole(?, ?)', [name, description || null]);
  return r[0][0];
}
async function deleteRole(id) {
  await pool.query('CALL sp_DeleteRole(?)', [id]);
}
async function getRolePermissions(roleId) {
  const [r] = await pool.query('CALL sp_GetRolePermissions(?)', [roleId]);
  return r[0];
}
async function setRolePermissions(roleId, permissionIds = []) {
  await pool.query('CALL sp_ClearRolePermissions(?)', [roleId]);
  for (const pid of permissionIds) {
    await pool.query('CALL sp_AddRolePermission(?, ?)', [roleId, pid]);
  }
}
async function getUserPermissions(userId) {
  const [r] = await pool.query('CALL sp_GetUserPermissions(?)', [userId]);
  return r[0]; // [{ module, action }]
}
async function getAdmins() {
  const [r] = await pool.query('CALL sp_GetAdmins()');
  return r[0];
}

module.exports = {
  getPermissions, getRoles, createRole, deleteRole,
  getRolePermissions, setRolePermissions, getUserPermissions, getAdmins,
};

const { pool } = require('../config/db');

/** Admin user-management data access (uses the Step-4 user procedures). */

async function getAllUsers() {
  const [rows] = await pool.query('CALL sp_GetAllUsers()');
  return rows[0];
}

async function updateUser(id, { name, phone, roleId, status }) {
  const [rows] = await pool.query('CALL sp_UpdateUser(?, ?, ?, ?, ?)', [
    id,
    name,
    phone || null,
    roleId || null,
    status || 'active',
  ]);
  return rows[0][0];
}

async function deleteUser(id) {
  await pool.query('CALL sp_DeleteUser(?)', [id]);
}

module.exports = { getAllUsers, updateUser, deleteUser };

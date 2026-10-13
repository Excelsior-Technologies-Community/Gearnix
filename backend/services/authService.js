const { pool } = require('../config/db');

/**
 * Auth/user data access. This is the ONLY layer that talks to the database,
 * and it does so exclusively through Stored Procedures (CALL sp_...). The
 * controller never writes SQL — it just calls these functions.
 *
 * Reminder on the return shape: a CALL returns [resultSets, fields], and the
 * first result set is an array of rows — hence rows[0][0] for a single row.
 */

async function registerUser({ name, email, phone, passwordHash }) {
  const [rows] = await pool.query('CALL sp_RegisterUser(?, ?, ?, ?)', [
    name,
    email,
    phone || null,
    passwordHash,
  ]);
  return rows[0][0];
}

async function getUserByEmail(email) {
  const [rows] = await pool.query('CALL sp_GetUserByEmail(?)', [email]);
  return rows[0][0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.query('CALL sp_GetUserById(?)', [id]);
  return rows[0][0] || null;
}

async function updateProfile(id, { name, phone }) {
  const [rows] = await pool.query('CALL sp_UpdateUserProfile(?, ?, ?)', [
    id,
    name,
    phone || null,
  ]);
  return rows[0][0];
}

async function updatePassword(id, passwordHash) {
  await pool.query('CALL sp_UpdateUserPassword(?, ?)', [id, passwordHash]);
}

module.exports = {
  registerUser,
  getUserByEmail,
  getUserById,
  updateProfile,
  updatePassword,
};

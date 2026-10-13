const { pool } = require('../config/db');

/** Returns the single row of dashboard statistics. */
async function getStats() {
  const [rows] = await pool.query('CALL sp_GetDashboardStats()');
  return rows[0][0];
}

module.exports = { getStats };

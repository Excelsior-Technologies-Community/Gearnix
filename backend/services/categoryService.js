const { pool } = require('../config/db');

/**
 * Category data access — talks to MySQL only through Stored Procedures.
 */

async function getCategories({ activeOnly = false } = {}) {
  const [rows] = await pool.query('CALL sp_GetCategories(?)', [activeOnly ? 1 : 0]);
  return rows[0];
}

async function getCategoryById(id) {
  const [rows] = await pool.query('CALL sp_GetCategoryById(?)', [id]);
  return rows[0][0] || null;
}

async function addCategory({ name, slug, description, status }) {
  const [rows] = await pool.query('CALL sp_AddCategory(?, ?, ?, ?)', [
    name,
    slug,
    description || null,
    status || 'active',
  ]);
  return rows[0][0];
}

async function updateCategory(id, { name, slug, description, status }) {
  const [rows] = await pool.query('CALL sp_UpdateCategory(?, ?, ?, ?, ?)', [
    id,
    name,
    slug,
    description || null,
    status || 'active',
  ]);
  return rows[0][0];
}

async function deleteCategory(id) {
  await pool.query('CALL sp_DeleteCategory(?)', [id]);
}

module.exports = {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};

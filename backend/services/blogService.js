const { pool } = require('../config/db');

/**
 * Blog data access — Stored Procedures only.
 */

async function getBlogs({ publishedOnly = false } = {}) {
  const [rows] = await pool.query('CALL sp_GetBlogs(?)', [publishedOnly ? 1 : 0]);
  return rows[0];
}

async function getBlogById(id) {
  const [rows] = await pool.query('CALL sp_GetBlogById(?)', [id]);
  return rows[0][0] || null;
}

async function getBlogBySlug(slug) {
  const [rows] = await pool.query('CALL sp_GetBlogBySlug(?)', [slug]);
  return rows[0][0] || null;
}

async function addBlog({ title, slug, featured_image, content, author, status }) {
  const [rows] = await pool.query('CALL sp_AddBlog(?, ?, ?, ?, ?, ?)', [
    title,
    slug,
    featured_image || null,
    content || null,
    author || null,
    status || 'draft',
  ]);
  return rows[0][0];
}

async function updateBlog(id, { title, slug, featured_image, content, author, status }) {
  const [rows] = await pool.query('CALL sp_UpdateBlog(?, ?, ?, ?, ?, ?, ?)', [
    id,
    title,
    slug,
    featured_image || null,
    content || null,
    author || null,
    status || 'draft',
  ]);
  return rows[0][0];
}

async function setBlogStatus(id, status) {
  const [rows] = await pool.query('CALL sp_SetBlogStatus(?, ?)', [id, status]);
  return rows[0][0];
}

async function deleteBlog(id) {
  await pool.query('CALL sp_DeleteBlog(?)', [id]);
}

module.exports = {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  addBlog,
  updateBlog,
  setBlogStatus,
  deleteBlog,
};

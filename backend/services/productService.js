const { pool } = require('../config/db');

/**
 * Product data access. All SQL lives in Stored Procedures; this layer just
 * calls them and stitches product + images together for the details view.
 */

async function getProducts({ activeOnly = false, categoryId = null, search = null } = {}) {
  const [rows] = await pool.query('CALL sp_GetProducts(?, ?, ?)', [
    activeOnly ? 1 : 0,
    categoryId || null,
    search || null,
  ]);
  return rows[0];
}

/**
 * Attach the gallery (`images`) and `related` products to a product object.
 * Shared by both getProductById and getProductBySlug so the details view is
 * identical however the product was looked up.
 */
async function enrichProduct(product) {
  const [imgRows] = await pool.query('CALL sp_GetProductImages(?)', [product.id]);
  product.images = imgRows[0];

  const [relRows] = await pool.query('CALL sp_GetRelatedProducts(?, ?)', [
    product.id,
    product.category_id || null,
  ]);
  product.related = relRows[0];

  return product;
}

/**
 * Returns the product (with images + related) by id, or null if not found.
 */
async function getProductById(id) {
  const [rows] = await pool.query('CALL sp_GetProductById(?)', [id]);
  const product = rows[0][0];
  if (!product) return null;
  return enrichProduct(product);
}

/**
 * Returns the product (with images + related) by URL slug, or null.
 */
async function getProductBySlug(slug) {
  const [rows] = await pool.query('CALL sp_GetProductBySlug(?)', [slug]);
  const product = rows[0][0];
  if (!product) return null;
  return enrichProduct(product);
}

async function addProduct(data) {
  const [rows] = await pool.query('CALL sp_AddProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    data.name,
    data.slug,
    data.short_description || null,
    data.description || null,
    data.price,
    data.discount_price ?? null,
    data.stock_quantity ?? 0,
    data.sku || null,
    data.category_id || null,
    data.status || 'active',
  ]);
  return rows[0][0].id; // the new product id
}

async function updateProduct(id, data) {
  await pool.query('CALL sp_UpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id,
    data.name,
    data.slug,
    data.short_description || null,
    data.description || null,
    data.price,
    data.discount_price ?? null,
    data.stock_quantity ?? 0,
    data.sku || null,
    data.category_id || null,
    data.status || 'active',
  ]);
}

async function deleteProduct(id) {
  await pool.query('CALL sp_DeleteProduct(?)', [id]);
}

/**
 * Replace a product's whole gallery with the given list of image URLs.
 * The first URL becomes the primary image.
 */
async function setProductImages(productId, imageUrls = []) {
  await pool.query('CALL sp_DeleteProductImages(?)', [productId]);
  for (let i = 0; i < imageUrls.length; i++) {
    await pool.query('CALL sp_AddProductImage(?, ?, ?, ?)', [
      productId,
      imageUrls[i],
      i === 0 ? 1 : 0, // first image = primary
      i,
    ]);
  }
}

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  addProduct,
  updateProduct,
  deleteProduct,
  setProductImages,
};

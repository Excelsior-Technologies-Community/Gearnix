const { pool } = require('../config/db');

// ─── Cart ───────────────────────────────────────────────────
async function getCart(userId) {
  const [r] = await pool.query('CALL sp_GetCart(?)', [userId]);
  return r[0];
}
async function addToCart(userId, productId, qty) {
  await pool.query('CALL sp_AddToCart(?, ?, ?)', [userId, productId, qty || 1]);
}
async function setCartItem(userId, productId, qty) {
  await pool.query('CALL sp_SetCartItem(?, ?, ?)', [userId, productId, qty]);
}
async function removeCartItem(userId, productId) {
  await pool.query('CALL sp_RemoveCartItem(?, ?)', [userId, productId]);
}
async function clearCart(userId) {
  await pool.query('CALL sp_ClearCart(?)', [userId]);
}

// ─── Wishlist ───────────────────────────────────────────────
async function getWishlist(userId) {
  const [r] = await pool.query('CALL sp_GetWishlist(?)', [userId]);
  return r[0];
}
async function addToWishlist(userId, productId) {
  await pool.query('CALL sp_AddToWishlist(?, ?)', [userId, productId]);
}
async function removeWishlistItem(userId, productId) {
  await pool.query('CALL sp_RemoveWishlistItem(?, ?)', [userId, productId]);
}

module.exports = {
  getCart, addToCart, setCartItem, removeCartItem, clearCart,
  getWishlist, addToWishlist, removeWishlistItem,
};

const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const svc = require('../services/cartWishlistService');

// ─── Cart ───────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) =>
  success(res, { message: 'Cart', data: { items: await svc.getCart(req.user.id) } }));

const addToCart = asyncHandler(async (req, res) => {
  await svc.addToCart(req.user.id, req.body.productId, req.body.quantity);
  return success(res, { message: 'Added to cart', data: { items: await svc.getCart(req.user.id) } });
});

const setCartItem = asyncHandler(async (req, res) => {
  await svc.setCartItem(req.user.id, req.params.productId, req.body.quantity);
  return success(res, { message: 'Cart updated', data: { items: await svc.getCart(req.user.id) } });
});

const removeCartItem = asyncHandler(async (req, res) => {
  await svc.removeCartItem(req.user.id, req.params.productId);
  return success(res, { message: 'Item removed', data: { items: await svc.getCart(req.user.id) } });
});

const clearCart = asyncHandler(async (req, res) => {
  await svc.clearCart(req.user.id);
  return success(res, { message: 'Cart cleared', data: { items: [] } });
});

// Merge a guest cart into the server cart (called on login).
const mergeCart = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  for (const it of items) {
    if (it?.id) await svc.addToCart(req.user.id, it.id, Number(it.quantity) || 1);
  }
  return success(res, { message: 'Cart merged', data: { items: await svc.getCart(req.user.id) } });
});

// ─── Wishlist ───────────────────────────────────────────────
const getWishlist = asyncHandler(async (req, res) =>
  success(res, { message: 'Wishlist', data: { items: await svc.getWishlist(req.user.id) } }));

const addToWishlist = asyncHandler(async (req, res) => {
  await svc.addToWishlist(req.user.id, req.body.productId);
  return success(res, { message: 'Added to wishlist', data: { items: await svc.getWishlist(req.user.id) } });
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  await svc.removeWishlistItem(req.user.id, req.params.productId);
  return success(res, { message: 'Removed from wishlist', data: { items: await svc.getWishlist(req.user.id) } });
});

const mergeWishlist = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  for (const it of items) { if (it?.id) await svc.addToWishlist(req.user.id, it.id); }
  return success(res, { message: 'Wishlist merged', data: { items: await svc.getWishlist(req.user.id) } });
});

module.exports = {
  getCart, addToCart, setCartItem, removeCartItem, clearCart, mergeCart,
  getWishlist, addToWishlist, removeWishlistItem, mergeWishlist,
};

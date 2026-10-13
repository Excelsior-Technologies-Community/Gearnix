const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');
const productService = require('../services/productService');
const razorpay = require('../utils/razorpay');

/**
 * POST /api/orders — create an order from cart items and open a Razorpay order.
 * Prices are recomputed on the server from the DB (the client is never trusted
 * on price). Returns the order plus Razorpay checkout info.
 * Body: { items: [{ id, quantity }], shipping: { name, phone, address } }
 */
const createOrder = asyncHandler(async (req, res) => {
  const { items = [], shipping = {} } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return error(res, { statusCode: 400, message: 'Your cart is empty' });
  }

  // Recompute line items from the database.
  let subtotal = 0;
  const lines = [];
  for (const it of items) {
    const product = await productService.getProductById(it.id);
    if (!product || product.status !== 'active') continue;
    const price = Number(product.discount_price || product.price);
    const qty = Math.max(1, Number(it.quantity) || 1);
    subtotal += price * qty;
    lines.push({ productId: product.id, productName: product.name, price, quantity: qty });
  }
  if (lines.length === 0) {
    return error(res, { statusCode: 400, message: 'No valid products in cart' });
  }
  const total = subtotal; // free shipping; taxes could be added here

  // Create the order + items.
  const order = await orderService.createOrder({
    userId: req.user.id, subtotal, total,
    name: shipping.name, phone: shipping.phone, address: shipping.address,
  });
  for (const line of lines) await orderService.addOrderItem(order.id, line);

  // Create the Razorpay order + a payment record.
  const rzpOrder = await razorpay.createOrder(Math.round(total * 100), order.order_number);
  await paymentService.createPayment({
    userId: req.user.id, orderId: order.id, razorpayOrderId: rzpOrder.id, amount: total,
  });

  return success(res, {
    statusCode: 201,
    message: 'Order created',
    data: {
      order: { ...order, total_amount: total },
      razorpay: {
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        keyId: razorpay.keyId,
        configured: razorpay.isConfigured, // false => frontend uses mock-complete flow
      },
    },
  });
});

/** GET /api/orders/my — current user's orders. */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  return success(res, { message: 'Orders fetched', data: { orders } });
});

/** GET /api/orders/:id — one order (owner or admin). */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  if (!order) return error(res, { statusCode: 404, message: 'Order not found' });
  const isOwner = String(order.user_id) === String(req.user.id);
  const isAdmin = req.user.role && req.user.role !== 'Customer';
  if (!isOwner && !isAdmin) return error(res, { statusCode: 403, message: 'Not allowed' });
  return success(res, { message: 'Order fetched', data: { order } });
});

/** GET /api/orders — all orders (admin). */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  return success(res, { message: 'Orders fetched', data: { orders } });
});

/** PUT /api/orders/:id/status — admin. */
const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  return success(res, { message: 'Order status updated', data: { order } });
});

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateStatus };

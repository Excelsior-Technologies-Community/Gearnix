const { pool } = require('../config/db');

async function createOrder({ userId, subtotal, total, name, phone, address }) {
  const [rows] = await pool.query('CALL sp_CreateOrder(?, ?, ?, ?, ?, ?)', [
    userId, subtotal, total, name || null, phone || null, address || null,
  ]);
  return rows[0][0];
}

async function addOrderItem(orderId, { productId, productName, price, quantity }) {
  await pool.query('CALL sp_AddOrderItem(?, ?, ?, ?, ?)', [orderId, productId || null, productName, price, quantity]);
}

async function getUserOrders(userId) {
  const [rows] = await pool.query('CALL sp_GetUserOrders(?)', [userId]);
  return rows[0];
}

async function getOrderById(id) {
  const [rows] = await pool.query('CALL sp_GetOrderById(?)', [id]);
  const order = rows[0][0];
  if (!order) return null;
  order.items = rows[1];
  return order;
}

async function getAllOrders() {
  const [rows] = await pool.query('CALL sp_GetAllOrders()');
  return rows[0];
}

async function updateOrderStatus(id, status) {
  const [rows] = await pool.query('CALL sp_UpdateOrderStatus(?, ?)', [id, status]);
  return rows[0][0];
}

module.exports = { createOrder, addOrderItem, getUserOrders, getOrderById, getAllOrders, updateOrderStatus };

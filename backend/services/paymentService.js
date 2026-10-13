const { pool } = require('../config/db');

async function createPayment({ userId, orderId, razorpayOrderId, amount }) {
  const [rows] = await pool.query('CALL sp_CreatePayment(?, ?, ?, ?)', [userId, orderId, razorpayOrderId, amount]);
  return rows[0][0];
}

async function markSuccess(orderId, razorpayPaymentId, signature) {
  await pool.query('CALL sp_MarkPaymentSuccess(?, ?, ?)', [orderId, razorpayPaymentId, signature || null]);
}

async function markFailed(orderId) {
  await pool.query('CALL sp_MarkPaymentFailed(?)', [orderId]);
}

async function getAllPayments() {
  const [rows] = await pool.query('CALL sp_GetAllPayments()');
  return rows[0];
}

module.exports = { createPayment, markSuccess, markFailed, getAllPayments };

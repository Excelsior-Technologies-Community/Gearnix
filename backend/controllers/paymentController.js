const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');
const razorpay = require('../utils/razorpay');

/**
 * POST /api/payments/verify — verify the Razorpay signature on the server.
 * Never trust the frontend's "payment success": we recompute the HMAC
 * signature (or accept in mock mode) before marking the order paid.
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const valid = razorpay.verifySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await paymentService.markFailed(orderId);
    return error(res, { statusCode: 400, message: 'Payment verification failed' });
  }

  await paymentService.markSuccess(orderId, razorpay_payment_id || 'mock_pay_' + Date.now(), razorpay_signature);
  return success(res, { message: 'Payment verified', data: { orderId, status: 'paid' } });
});

/** GET /api/payments — all payments (admin). */
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getAllPayments();
  return success(res, { message: 'Payments fetched', data: { payments } });
});

module.exports = { verifyPayment, getAllPayments };

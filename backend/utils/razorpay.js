const crypto = require('crypto');

/**
 * Razorpay helper.
 *
 * If real keys are present in .env it uses the live SDK. If the keys are still
 * the placeholders, it runs in MOCK mode so the full order → pay → verify flow
 * works end-to-end for development/demo (payments are auto-approved). Swap in
 * real keys to go live — no code changes needed.
 */
let Razorpay;
try { Razorpay = require('razorpay'); } catch { Razorpay = null; }

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const isConfigured =
  !!KEY_ID && !!KEY_SECRET &&
  !KEY_ID.includes('your_razorpay') && !KEY_SECRET.includes('your_razorpay');

const client = isConfigured && Razorpay ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET }) : null;

/** Create a Razorpay order (or a mock one). amount is in paise. */
async function createOrder(amountPaise, receipt) {
  if (client) {
    return client.orders.create({ amount: amountPaise, currency: 'INR', receipt });
  }
  return { id: 'order_mock_' + Date.now(), amount: amountPaise, currency: 'INR', status: 'created', mock: true };
}

/** Verify the checkout signature. In mock mode it always passes. */
function verifySignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  if (!isConfigured) return true; // mock mode
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return expected === signature;
}

module.exports = { isConfigured, keyId: KEY_ID, createOrder, verifySignature };

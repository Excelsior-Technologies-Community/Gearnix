const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/**
 * @swagger
 * tags: { name: Payments, description: Razorpay payment verification & records }
 */

router.post('/verify', authenticate, paymentController.verifyPayment);
router.get('/', authenticate, requirePermission('Payments','view'), paymentController.getAllPayments);

module.exports = router;

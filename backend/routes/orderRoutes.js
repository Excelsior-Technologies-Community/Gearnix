const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const orderController = require('../controllers/orderController');

const router = express.Router();

/**
 * @swagger
 * tags: { name: Orders, description: Orders & checkout }
 */

// Create order (user)
router.post('/', authenticate, [body('items').isArray({ min: 1 }).withMessage('Cart is empty')], validate, orderController.createOrder);

// Current user's orders
router.get('/my', authenticate, orderController.getMyOrders);

// All orders (admin) — specific path before /:id
router.get('/', authenticate, requirePermission('Orders','view'), orderController.getAllOrders);

// Update status (admin)
router.put('/:id/status', authenticate, requirePermission('Orders','edit'), [body('status').notEmpty()], validate, orderController.updateStatus);

// One order (owner or admin)
router.get('/:id', authenticate, orderController.getOrder);

module.exports = router;

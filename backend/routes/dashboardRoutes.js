const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Admin dashboard statistics
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats fetched }
 *       403: { description: Admin access only }
 */
router.get('/', authenticate, requirePermission('Dashboard','view'), dashboardController.getStats);

module.exports = router;

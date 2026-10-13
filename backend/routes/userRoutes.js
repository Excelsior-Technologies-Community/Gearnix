const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin user management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users fetched }
 *       403: { description: Admin access only }
 */
router.get('/', authenticate, requirePermission('Users','view'), userController.getUsers);
router.put('/:id', authenticate, requirePermission('Users','delete'), userController.updateUser);
router.delete('/:id', authenticate, requirePermission('Users','delete'), userController.deleteUser);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

/**
 * @swagger
 * tags: { name: Admin, description: Admin management, roles & permissions (RBAC) }
 */

// Everything here needs an authenticated staff user with the right permission.
router.use(authenticate);

// Roles & permissions
router.get('/permissions', requirePermission('Admins', 'view'), adminController.getPermissions);
router.get('/roles', requirePermission('Admins', 'view'), adminController.getRoles);
router.post('/roles', requirePermission('Admins', 'add'), [body('name').trim().notEmpty()], validate, adminController.createRole);
router.delete('/roles/:id', requirePermission('Admins', 'delete'), adminController.deleteRole);
router.get('/roles/:id/permissions', requirePermission('Admins', 'view'), adminController.getRolePermissions);
router.put('/roles/:id/permissions', requirePermission('Admins', 'edit'), adminController.setRolePermissions);

// Admins / sub-admins
router.get('/admins', requirePermission('Admins', 'view'), adminController.getAdmins);
router.post('/admins', requirePermission('Admins', 'add'), [
  body('name').trim().notEmpty(),
  body('email').trim().isEmail(),
  body('password').isLength({ min: 6 }),
  body('roleId').notEmpty(),
], validate, adminController.createSubAdmin);
router.put('/admins/:id', requirePermission('Admins', 'edit'), adminController.updateAdmin);
router.delete('/admins/:id', requirePermission('Admins', 'delete'), adminController.deleteAdmin);

module.exports = router;

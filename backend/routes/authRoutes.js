const express = require('express');
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration, login and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: John Doe }
 *               email:    { type: string, example: john@demo.com }
 *               phone:    { type: string, example: "9999999999" }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already registered }
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional({ values: 'falsy' }).matches(/^[0-9+-s()]{6,20}$/).withMessage('Invalid phone number'),
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: john@demo.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid email or password }
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.login
);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Log in to the admin panel (staff accounts only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: admin@gearnix.com }
 *               password: { type: string, example: Admin@123 }
 *     responses:
 *       200: { description: Admin login successful }
 *       401: { description: Invalid email or password }
 *       403: { description: Not an admin account }
 */
router.post(
  '/admin/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.adminLogin
);

/**
 * @swagger
 * /api/auth/admin/me:
 *   get:
 *     summary: Verify the current admin session (staff only)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile fetched }
 *       403: { description: Admin access only }
 */
router.get('/admin/me', authenticate, requireAdmin, authController.me);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: john@demo.com }
 *     responses:
 *       200: { description: Reset link sent if the email exists }
 */
router.post(
  '/forgot-password',
  [body('email').trim().isEmail().withMessage('Valid email is required')],
  validate,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Set a new password using a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:    { type: string }
 *               password: { type: string, example: newsecret123 }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired token }
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile fetched }
 *       401: { description: Authentication required }
 */
router.get('/me', authenticate, authController.me);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update the logged-in user's name/phone
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:  { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put(
  '/profile',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').optional({ values: 'falsy' }).matches(/^[0-9+-s()]{6,20}$/).withMessage('Invalid phone number'),
  ],
  validate,
  authController.updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string, example: newsecret123 }
 *     responses:
 *       200: { description: Password changed successfully }
 *       400: { description: Current password is incorrect }
 */
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;

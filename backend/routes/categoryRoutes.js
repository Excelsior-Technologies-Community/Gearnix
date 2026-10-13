const express = require('express');
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories (public reads, admin writes)
 */

// Validation rules reused by create + update.
const categoryRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'"),
];

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *         description: If true, returns only active categories (landing page)
 *     responses:
 *       200: { description: Categories fetched }
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category fetched }
 *       404: { description: Category not found }
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string, example: Gaming Keyboards }
 *               description:  { type: string }
 *               status:      { type: string, enum: [active, inactive] }
 *     responses:
 *       201: { description: Category created }
 *       403: { description: Admin access only }
 *       409: { description: Duplicate name/slug }
 */
router.post('/', authenticate, requirePermission('Categories','add'), categoryRules, validate, categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category updated }
 *       404: { description: Category not found }
 */
router.put('/:id', authenticate, requirePermission('Categories','edit'), categoryRules, validate, categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category deleted }
 *       404: { description: Category not found }
 */
router.delete('/:id', authenticate, requirePermission('Categories','delete'), categoryController.deleteCategory);

module.exports = router;

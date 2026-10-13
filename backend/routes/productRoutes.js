const express = require('express');
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products (public reads, admin writes)
 */

// Shared validation rules for create + update.
const productRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').notEmpty().withMessage('Price is required').bail().isFloat({ min: 0 }).withMessage('Price must be a number ≥ 0'),
  body('discount_price').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Discount price must be a number ≥ 0'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock must be a whole number ≥ 0'),
  body('category_id').optional({ values: 'null' }).isInt({ min: 1 }).withMessage('category_id must be a valid id'),
  body('status').optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'"),
  body('images').optional().isArray().withMessage('images must be an array of URLs'),
];

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - { in: query, name: active,   schema: { type: boolean }, description: Only active products }
 *       - { in: query, name: category, schema: { type: integer }, description: Filter by category id }
 *       - { in: query, name: search,   schema: { type: string },  description: Keyword in name/short description }
 *     responses:
 *       200: { description: Products fetched }
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Get product details by URL slug (with images + related)
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Product fetched }
 *       404: { description: Product not found }
 */
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product with its images + related
 *     tags: [Products]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Product fetched }
 *       404: { description: Product not found }
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:              { type: string, example: Pro Gaming Keyboard }
 *               short_description: { type: string }
 *               description:       { type: string }
 *               price:             { type: number, example: 4999 }
 *               discount_price:    { type: number, example: 3999 }
 *               stock_quantity:    { type: integer, example: 25 }
 *               sku:               { type: string, example: KB-PRO-001 }
 *               category_id:       { type: integer, example: 1 }
 *               status:            { type: string, enum: [active, inactive] }
 *               images:            { type: array, items: { type: string }, example: ["https://.../1.jpg"] }
 *     responses:
 *       201: { description: Product created }
 *       403: { description: Admin access only }
 *       409: { description: Duplicate slug/SKU }
 */
router.post('/', authenticate, requirePermission('Products','add'), productRules, validate, productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Product updated }
 *       404: { description: Product not found }
 */
router.put('/:id', authenticate, requirePermission('Products','edit'), productRules, validate, productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Product deleted }
 *       404: { description: Product not found }
 */
router.delete('/:id', authenticate, requirePermission('Products','delete'), productController.deleteProduct);

module.exports = router;

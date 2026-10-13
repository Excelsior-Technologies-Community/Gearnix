const express = require('express');
const { body } = require('express-validator');

const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const blogController = require('../controllers/blogController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog posts (public reads, admin writes)
 */

const blogRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['draft', 'published']).withMessage("Status must be 'draft' or 'published'"),
];

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: List blog posts
 *     tags: [Blogs]
 *     parameters:
 *       - { in: query, name: published, schema: { type: boolean }, description: Only published posts (landing) }
 *     responses:
 *       200: { description: Blogs fetched }
 */
router.get('/', blogController.getBlogs);

/**
 * @swagger
 * /api/blogs/slug/{slug}:
 *   get:
 *     summary: Get a blog post by URL slug
 *     tags: [Blogs]
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Blog fetched }
 *       404: { description: Blog not found }
 */
router.get('/slug/:slug', blogController.getBlogBySlug);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog post by id
 *     tags: [Blogs]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Blog fetched }
 *       404: { description: Blog not found }
 */
router.get('/:id', blogController.getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a blog post (admin)
 *     tags: [Blogs]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:          { type: string, example: Top 5 Gaming Keyboards of 2026 }
 *               featured_image: { type: string }
 *               content:        { type: string }
 *               author:         { type: string, example: Gearnix Team }
 *               status:         { type: string, enum: [draft, published] }
 *     responses:
 *       201: { description: Blog created }
 *       403: { description: Admin access only }
 *       409: { description: Duplicate title/slug }
 */
router.post('/', authenticate, requirePermission('Blogs','add'), blogRules, validate, blogController.createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog post (admin)
 *     tags: [Blogs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Blog updated }
 *       404: { description: Blog not found }
 */
router.put('/:id', authenticate, requirePermission('Blogs','edit'), blogRules, validate, blogController.updateBlog);

/**
 * @swagger
 * /api/blogs/{id}/status:
 *   patch:
 *     summary: Publish / unpublish a blog post (admin)
 *     tags: [Blogs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [draft, published] }
 *     responses:
 *       200: { description: Status updated }
 *       404: { description: Blog not found }
 */
router.patch(
  '/:id/status',
  authenticate,
  requirePermission('Blogs','edit'),
  [body('status').isIn(['draft', 'published']).withMessage("Status must be 'draft' or 'published'")],
  validate,
  blogController.setBlogStatus
);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog post (admin)
 *     tags: [Blogs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Blog deleted }
 *       404: { description: Blog not found }
 */
router.delete('/:id', authenticate, requirePermission('Blogs','delete'), blogController.deleteBlog);

module.exports = router;

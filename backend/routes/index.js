const express = require('express');

const router = express.Router();

/**
 * Central API router. Every feature module registers its own router here in
 * later steps, e.g.:
 *
 *   router.use('/auth', require('./authRoutes'));
 *   router.use('/products', require('./productRoutes'));
 *
 * For now it only exposes a health check so the API surface is verifiable.
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gearnix API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── Feature modules ─────────────────────────────────────────
router.use('/auth', require('./authRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/blogs', require('./blogRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;

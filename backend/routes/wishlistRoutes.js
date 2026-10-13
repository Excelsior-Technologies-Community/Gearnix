const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const c = require('../controllers/cartWishlistController');

const router = express.Router();

/**
 * @swagger
 * tags: { name: Wishlist, description: Logged-in user's wishlist }
 */
router.use(authenticate);
router.get('/', c.getWishlist);
router.post('/', c.addToWishlist);
router.post('/merge', c.mergeWishlist);
router.delete('/:productId', c.removeWishlistItem);

module.exports = router;

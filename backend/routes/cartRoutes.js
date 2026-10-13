const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const c = require('../controllers/cartWishlistController');

const router = express.Router();

/**
 * @swagger
 * tags: { name: Cart, description: Logged-in user's cart }
 */
router.use(authenticate);
router.get('/', c.getCart);
router.post('/', c.addToCart);
router.post('/merge', c.mergeCart);
router.put('/:productId', c.setCartItem);
router.delete('/:productId', c.removeCartItem);
router.delete('/', c.clearCart);

module.exports = router;

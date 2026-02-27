const express = require('express');
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/items/:cartItemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:cartItemId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;

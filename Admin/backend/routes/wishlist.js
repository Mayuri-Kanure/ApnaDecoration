const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const validateAddToWishlist = [
  body('productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID')
];

// Get user's wishlist
router.get('/', auth, wishlistController.getWishlist);

// Add item to wishlist
router.post('/', auth, validateAddToWishlist, wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:productId', auth, wishlistController.removeFromWishlist);

// Move item from wishlist to cart
router.post('/move-to-cart/:productId', auth, wishlistController.moveToCart);

// Move all items from wishlist to cart
router.post('/move-all-to-cart', auth, wishlistController.moveAllToCart);

// Clear wishlist
router.delete('/', auth, wishlistController.clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', auth, wishlistController.checkWishlist);

module.exports = router;

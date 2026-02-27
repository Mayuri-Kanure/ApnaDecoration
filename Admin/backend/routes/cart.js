const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { body, param } = require('express-validator');

// Validation middleware
const validateAddToCart = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object')
];

const validateUpdateCartItem = [
  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

const validateRemoveFromCart = [
  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID')
];

const validateMergeGuestCart = [
  body('guestCartItems')
    .isArray()
    .withMessage('Guest cart items must be an array'),
  body('guestCartItems.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('guestCartItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer for each item')
];

// Public routes (work for both authenticated and guest users)
router.get('/', cartController.getCart);
router.post('/', validateAddToCart, cartController.addToCart);
router.put('/items/:itemId', validateUpdateCartItem, cartController.updateCartItem);
router.delete('/items/:itemId', validateRemoveFromCart, cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.get('/summary', cartController.getCartSummary);

// Protected route (merge guest cart on login)
router.post('/merge', auth, validateMergeGuestCart, cartController.mergeGuestCart);

module.exports = router;

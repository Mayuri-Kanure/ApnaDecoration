const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const paymentMethodController = require('../controllers/paymentMethodController');

const router = express.Router();

// Get all payment methods (protected)
router.get('/', authMiddleware, paymentMethodController.getPaymentMethods);

// Get payment method by ID (protected)
router.get('/:id', authMiddleware, paymentMethodController.getPaymentMethod);

// Create new payment method (protected)
router.post('/', authMiddleware, paymentMethodController.createPaymentMethod);

// Update payment method (protected)
router.put('/:id', authMiddleware, paymentMethodController.updatePaymentMethod);

// Delete payment method (protected)
router.delete('/:id', authMiddleware, paymentMethodController.deletePaymentMethod);

// Set default payment method (protected)
router.put('/:id/default', authMiddleware, paymentMethodController.setDefaultPaymentMethod);

module.exports = router;

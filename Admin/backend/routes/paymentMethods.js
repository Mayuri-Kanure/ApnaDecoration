const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { auth } = require('../middleware/auth');

// Get all payment methods for user
router.get('/', auth, paymentMethodController.getPaymentMethods);

// Get payment method by ID
router.get('/:id', auth, paymentMethodController.getPaymentMethod);

// Create new payment method
router.post('/', auth, paymentMethodController.validatePaymentMethod, paymentMethodController.createPaymentMethod);

// Update payment method
router.put('/:id', auth, paymentMethodController.validatePaymentMethod, paymentMethodController.updatePaymentMethod);

// Delete payment method
router.delete('/:id', auth, paymentMethodController.deletePaymentMethod);

// Set default payment method
router.patch('/:id/default', auth, paymentMethodController.setDefaultPaymentMethod);

module.exports = router;

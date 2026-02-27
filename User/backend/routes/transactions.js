const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Create transaction
router.post('/', [
  auth,
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('method').optional().isIn(['razorpay', 'cod', 'wallet', 'upi', 'card', 'netbanking']).withMessage('Invalid payment method')
], transactionController.createTransaction);

// Get transaction by ID
router.get('/:id', auth, transactionController.getTransactionById);

// Get user transactions
router.get('/user/my-transactions', auth, transactionController.getUserTransactions);

// Get all transactions (admin only)
router.get('/admin/all', auth, transactionController.getAllTransactions);

// Get transactions by order ID
router.get('/order/:orderId', auth, transactionController.getTransactionsByOrderId);

// Update transaction status (admin only)
router.patch('/:id/status', auth, transactionController.updateTransactionStatus);

// Process refund (admin only)
router.post('/:id/refund', [
  auth,
  body('refundAmount').isNumeric().withMessage('Refund amount must be a number'),
  body('refundReason').optional().isString().withMessage('Refund reason must be a string')
], transactionController.processRefund);

// Get transaction statistics (admin only)
router.get('/admin/statistics', auth, transactionController.getTransactionStatistics);

// Get payment methods breakdown (admin only)
router.get('/admin/payment-methods', auth, transactionController.getPaymentMethodsBreakdown);

module.exports = router;

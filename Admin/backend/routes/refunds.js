const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { auth, authorize } = require('../middleware/auth');

// Get all refunds with filtering and pagination
router.get('/', auth, refundController.getRefunds);

// Get refund statistics
router.get('/stats', auth, refundController.getRefundStats);

// Get refund by ID
router.get('/:id', auth, refundController.getRefund);

// Create new refund request
router.post('/', auth, refundController.createRefund);

// Update refund status
router.patch('/:id/status', auth, authorize('admin', 'manager'), refundController.updateRefundStatus);

// Update refund details
router.put('/:id', auth, authorize('admin', 'manager'), refundController.updateRefund);

// Delete refund
router.delete('/:id', auth, authorize('admin'), refundController.deleteRefund);

// Export refunds to CSV
router.get('/export/csv', auth, refundController.exportRefunds);

module.exports = router;

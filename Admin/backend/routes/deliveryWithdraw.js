const express = require('express');
const router = express.Router();
const deliveryWithdrawController = require('../controllers/deliveryWithdrawController');
const { auth, authorize } = require('../middleware/auth');

// Get all delivery withdraw requests
router.get('/', auth, deliveryWithdrawController.getDeliveryWithdraws);

// Get withdraw requests by delivery ID
router.get('/delivery/:deliveryId', auth, deliveryWithdrawController.getWithdrawsByDeliveryId);

// Export delivery withdraw requests
router.get('/export', auth, authorize('admin', 'manager'), deliveryWithdrawController.exportDeliveryWithdraws);

// Get withdraw request by ID
router.get('/:id', auth, deliveryWithdrawController.getDeliveryWithdrawById);

// Create delivery withdraw request
router.post('/', auth, authorize('admin', 'manager'), deliveryWithdrawController.createDeliveryWithdraw);

// Approve withdraw request
router.patch('/:id/approve', auth, authorize('admin', 'manager'), deliveryWithdrawController.approveDeliveryWithdraw);

// Reject withdraw request
router.patch('/:id/reject', auth, authorize('admin', 'manager'), deliveryWithdrawController.rejectDeliveryWithdraw);

// Complete withdraw request
router.patch('/:id/complete', auth, authorize('admin', 'manager'), deliveryWithdrawController.completeDeliveryWithdraw);

module.exports = router;

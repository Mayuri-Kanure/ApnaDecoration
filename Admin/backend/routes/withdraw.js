const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const { auth, authorize } = require('../middleware/auth');

// Get all withdraw requests
router.get('/', auth, withdrawController.getWithdraws);

// Export withdraw requests
router.get('/export', auth, authorize('admin', 'manager'), withdrawController.exportWithdraws);

// Get withdraw request by ID
router.get('/:id', auth, withdrawController.getWithdrawById);

// Create withdraw request
router.post('/', auth, withdrawController.createWithdraw);

// Approve withdraw request
router.patch('/:id/approve', auth, authorize('admin', 'manager'), withdrawController.approveWithdraw);

// Reject withdraw request
router.patch('/:id/reject', auth, authorize('admin', 'manager'), withdrawController.rejectWithdraw);

module.exports = router;

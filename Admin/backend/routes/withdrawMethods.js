const express = require('express');
const router = express.Router();
const withdrawMethodController = require('../controllers/withdrawMethodController');
const { auth, authorize } = require('../middleware/auth');

// Get all withdraw methods
router.get('/', auth, withdrawMethodController.getWithdrawMethods);

// Get active withdraw methods (for dropdowns/forms)
router.get('/active', auth, withdrawMethodController.getActiveWithdrawMethods);

// Get withdraw method by ID
router.get('/:id', auth, withdrawMethodController.getWithdrawMethodById);

// Create withdraw method
router.post('/', auth, authorize('admin', 'manager'), withdrawMethodController.createWithdrawMethod);

// Update withdraw method
router.put('/:id', auth, authorize('admin', 'manager'), withdrawMethodController.updateWithdrawMethod);

// Delete withdraw method
router.delete('/:id', auth, authorize('admin', 'manager'), withdrawMethodController.deleteWithdrawMethod);

module.exports = router;

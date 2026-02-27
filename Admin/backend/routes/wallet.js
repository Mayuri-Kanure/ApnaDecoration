const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth, authorize } = require('../middleware/auth');

// Get all wallet transactions
router.get('/', auth, walletController.getWalletTransactions);

// Get wallet statistics
router.get('/stats', auth, authorize('admin', 'manager'), walletController.getWalletStats);

// Add wallet transaction
router.post('/', auth, authorize('admin', 'manager'), walletController.addWalletTransaction);

module.exports = router;

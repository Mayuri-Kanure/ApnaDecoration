const express = require('express');
const router = express.Router();
const walletBonusController = require('../controllers/walletBonusController');
const { auth, authorize } = require('../middleware/auth');

// Get all wallet bonuses
router.get('/', auth, walletBonusController.getWalletBonuses);

// Get wallet bonus by ID
router.get('/:id', auth, walletBonusController.getWalletBonusById);

// Add wallet bonus
router.post('/', auth, authorize('admin', 'manager'), walletBonusController.addWalletBonus);

// Update wallet bonus
router.put('/:id', auth, authorize('admin', 'manager'), walletBonusController.updateWalletBonus);

// Delete wallet bonus
router.delete('/:id', auth, authorize('admin', 'manager'), walletBonusController.deleteWalletBonus);

module.exports = router;

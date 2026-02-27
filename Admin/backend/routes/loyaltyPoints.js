const express = require('express');
const router = express.Router();
const loyaltyPointController = require('../controllers/loyaltyPointController');
const { auth, authorize } = require('../middleware/auth');

// Get all loyalty point transactions
router.get('/', auth, loyaltyPointController.getLoyaltyPoints);

// Get loyalty point statistics
router.get('/stats', auth, authorize('admin', 'manager'), loyaltyPointController.getLoyaltyStats);

// Get customer specific loyalty points
router.get('/customer/:customerId', auth, loyaltyPointController.getCustomerLoyaltyPoints);

// Add loyalty points transaction
router.post('/', auth, authorize('admin', 'manager'), loyaltyPointController.addLoyaltyPoints);

module.exports = router;

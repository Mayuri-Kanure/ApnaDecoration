const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Get all addresses (protected)
router.get('/', authMiddleware, addressController.getAddresses);

// Get address by ID (protected)
router.get('/:id', authMiddleware, addressController.getAddress);

// Create new address (protected)
router.post('/', authMiddleware, addressController.createAddress);

// Update address (protected)
router.put('/:id', authMiddleware, addressController.updateAddress);

// Delete address (protected)
router.delete('/:id', authMiddleware, addressController.deleteAddress);

// Set default address (protected)
router.put('/:id/default', authMiddleware, addressController.setDefaultAddress);

module.exports = router;
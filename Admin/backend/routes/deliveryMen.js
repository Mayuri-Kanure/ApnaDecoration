const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

// Get all delivery men
router.get('/', auth, deliveryController.getDeliveries);

// Get available delivery men
router.get('/available', auth, deliveryController.getAvailableDeliveries);

// Get delivery man by ID
router.get('/:id', auth, deliveryController.getDeliveryById);

// Create new delivery man with file uploads
router.post('/', 
  auth, 
  authorize('admin', 'manager'), 
  deliveryController.uploadDeliveryImages,
  deliveryController.createDelivery
);

// Update delivery man with file uploads
router.put('/:id', 
  auth, 
  authorize('admin', 'manager'), 
  deliveryController.uploadDeliveryImages,
  deliveryController.updateDelivery
);

module.exports = router;

const express = require('express');
const router = express.Router();
const clearanceSaleController = require('../controllers/clearanceSaleController');
const { auth, authorize } = require('../middleware/auth');

// Get all clearance sale data
router.get('/', auth, authorize('admin', 'manager'), clearanceSaleController.getClearanceSaleData);

// Inhouse Offer routes
router.put('/inhouse-offer', auth, authorize('admin', 'manager'), clearanceSaleController.updateInhouseOffer);

// Vendor Offer routes
router.post('/vendor-offers', auth, authorize('admin', 'manager'), clearanceSaleController.addVendorOffer);
router.put('/vendor-offers/:offerId', auth, authorize('admin', 'manager'), clearanceSaleController.updateVendorOffer);
router.delete('/vendor-offers/:offerId', auth, authorize('admin', 'manager'), clearanceSaleController.deleteVendorOffer);

// Priority Settings routes
router.put('/priority-settings', auth, authorize('admin', 'manager'), clearanceSaleController.updatePrioritySettings);

// Get available data for forms
router.get('/vendors', auth, authorize('admin', 'manager'), clearanceSaleController.getAvailableVendors);

// Public route (no auth required)
router.get('/public', clearanceSaleController.getPublicClearanceSale);

// Public route for clearance products (no auth required)
router.get('/products', clearanceSaleController.getPublicClearanceProducts);

module.exports = router;

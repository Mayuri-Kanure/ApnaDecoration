const express = require('express');
const router = express.Router();
const businessSettingsController = require('../controllers/businessSettingsController');
const { auth, authorize } = require('../middleware/auth');

// Get business settings
router.get('/', auth, businessSettingsController.getBusinessSettings);

// Update business settings
router.put('/', auth, authorize('admin'), businessSettingsController.updateBusinessSettings);

// Update specific section of business settings
router.put('/:section', auth, authorize('admin'), businessSettingsController.updateBusinessSection);

// Reset business settings to defaults
router.post('/reset', auth, authorize('admin'), businessSettingsController.resetBusinessSettings);

// Export business settings
router.get('/export', auth, authorize('admin'), businessSettingsController.exportBusinessSettings);

// Import business settings
router.post('/import', auth, authorize('admin'), businessSettingsController.importBusinessSettings);

// Get business settings statistics
router.get('/stats', auth, authorize('admin'), businessSettingsController.getBusinessSettingsStats);

module.exports = router;

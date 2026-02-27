const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth.js');
const {
  getSettings,
  updateSettings,
  updateFirebaseConfig,
  updatePushNotificationMessages,
  getFirebaseConfig,
  getPushNotificationMessages,
  getPaymentOptions,
  updatePaymentOptions,
  getOrderSettings,
  updateOrderSettings
} = require('../controllers/adminSettingsController.js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all settings - temporarily disabled auth for testing
router.get('/', getSettings);

// Update general settings - temporarily disabled auth for testing
router.put('/', upload.any(), updateSettings);

// Firebase configuration routes - temporarily disabled auth for testing
router.get('/firebase', getFirebaseConfig);
router.post('/firebase', updateFirebaseConfig);

// Push notification messages routes - temporarily disabled auth for testing
router.get('/push-messages', getPushNotificationMessages);
router.post('/push-messages', updatePushNotificationMessages);

// Payment options routes - temporarily disabled auth for testing
router.get('/payment-options', getPaymentOptions);
router.put('/payment-options', updatePaymentOptions);

// Order settings routes - temporarily disabled auth for testing
router.get('/order-settings', getOrderSettings);
router.put('/order-settings', updateOrderSettings);

module.exports = router;

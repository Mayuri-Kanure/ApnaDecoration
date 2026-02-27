const express = require('express');
const router = express.Router();
const vendorRegistrationController = require('../controllers/vendorRegistrationController');

// GET vendor registration content
router.get('/', vendorRegistrationController.getVendorRegistration);

// UPDATE vendor registration content
router.put('/', vendorRegistrationController.updateVendorRegistration);

// UPLOAD header image
router.post('/upload-header-image', vendorRegistrationController.uploadHeaderImage);

// DELETE header image
router.delete('/header-image', vendorRegistrationController.deleteHeaderImage);

module.exports = router;

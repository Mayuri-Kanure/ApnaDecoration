const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorProductController');
const { auth } = require('../middleware/auth');

// Vendor-specific routes
router.get('/products', auth, vendorController.getVendorProducts);
router.post('/products', auth, vendorController.createVendorProduct);
router.put('/products/:id', auth, vendorController.updateVendorProduct);

module.exports = router;

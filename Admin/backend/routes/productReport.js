const express = require('express');
const router = express.Router();
const productReportController = require('../controllers/productReportController');
const { auth, authorize } = require('../middleware/auth');

// Get all products with statistics
router.get('/products', auth, authorize('admin'), productReportController.getAllProducts);

// Get product stock information
router.get('/stock', auth, authorize('admin'), productReportController.getProductStock);

// Get wish listed products
router.get('/wishlist', auth, authorize('admin'), productReportController.getWishlistProducts);

// Export product data
router.get('/export', auth, authorize('admin'), productReportController.exportProducts);

module.exports = router;

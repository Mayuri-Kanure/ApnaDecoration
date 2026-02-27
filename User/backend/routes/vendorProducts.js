const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const vendorProductController = require('../controllers/vendorProductController');
const { uploadVendorImages } = require('../middlewares/vendorUpload');

const router = express.Router();

// Get all vendor products (admin only)
router.get('/', authMiddleware, vendorProductController.getVendorProducts);

// Get new vendor product requests (admin only)
router.get('/new-requests', authMiddleware, vendorProductController.getNewRequests);

// Get approved vendor products (admin only)
router.get('/approved', authMiddleware, vendorProductController.getApprovedProducts);

// Get denied vendor products (admin only)
router.get('/denied', authMiddleware, vendorProductController.getDeniedProducts);

// Get pending vendor products (admin only) - Fixed route
router.get('/status/pending', authMiddleware, vendorProductController.getPendingProducts);

// Approve vendor product (admin only)
router.put('/approve/:id', authMiddleware, vendorProductController.approveProduct);

// Deny vendor product (admin only)
router.put('/deny/:id', authMiddleware, vendorProductController.denyProduct);

// Create vendor product (vendor only)
router.post('/', authMiddleware, uploadVendorImages, vendorProductController.createVendorProduct);

// Get vendor's own products (vendor only)
router.get('/my-products', authMiddleware, vendorProductController.getMyVendorProducts);

// Get single vendor product (vendor only)
router.get('/:id', authMiddleware, vendorProductController.getVendorProduct);

// Update vendor product (vendor only)
router.put('/:id', authMiddleware, vendorProductController.updateVendorProduct);

// Update vendor product with files (vendor only)
router.put('/:id/files', authMiddleware, uploadVendorImages, vendorProductController.updateVendorProductWithFiles);

// Delete vendor product (vendor only)
router.delete('/:id', authMiddleware, vendorProductController.deleteVendorProduct);

module.exports = router;

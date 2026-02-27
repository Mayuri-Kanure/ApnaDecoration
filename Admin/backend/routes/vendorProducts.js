const express = require('express');
const router = express.Router();
const vendorProductController = require('../controllers/vendorProductController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middlewares/upload');

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔍 Vendor Products Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Simple test route to verify file is loaded
router.get('/route-test', (req, res) => {
  res.json({ 
    message: 'Vendor products routes are loaded!', 
    timestamp: new Date(),
    routes: ['reconsider', 'approve', 'deny', 'toggle-status', 'toggle-featured']
  });
});

// GET all vendor products with filtering and pagination
router.get('/', auth, vendorProductController.getAllVendorProducts);

// GET vendor's own products (for vendor portal)
router.get('/my-products', auth, vendorProductController.getVendorProducts);

// GET vendor products by status (pending, approved, denied)
router.get('/status/:status', auth, vendorProductController.getVendorProductsByStatus);

// GET new vendor products requests (alias for pending)
router.get('/new-requests', auth, vendorProductController.getVendorProductsByStatus);

// GET approved vendor products
router.get('/approved', auth, vendorProductController.getVendorProductsByStatus);

// GET denied vendor products
router.get('/denied', auth, vendorProductController.getVendorProductsByStatus);

// GET vendor analytics
router.get('/analytics/:vendorId', auth, vendorProductController.getVendorAnalytics);

// GET brands for filter dropdown
router.get('/filter/brands', auth, vendorProductController.getBrands);

// GET categories for filter dropdown
router.get('/filter/categories', auth, vendorProductController.getCategories);

// EXPORT products to CSV
router.get('/export', auth, vendorProductController.exportProducts);

// SEARCH products
router.get('/search', auth, vendorProductController.searchProducts);

// CREATE new vendor product
router.post('/', auth, upload.array('images', 10), (req, res, next) => {
  // Log the raw request for debugging
  console.log('=== VENDOR PRODUCT CREATE ROUTE HIT ===');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request files:', req.files ? req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname, path: f.path })) : 'No files');
  
  // Continue to controller
  vendorProductController.createVendorProduct(req, res);
});

// RECONSIDER denied vendor product (must come before generic /:id route)
router.post('/:id/reconsider', auth, (req, res, next) => {
  console.log('🎯 RECONSIDER ROUTE HIT! Product ID:', req.params.id);
  console.log('🎯 Full URL:', req.originalUrl);
  next();
}, vendorProductController.reconsiderVendorProduct);

// APPROVE vendor product (admin only)
router.put('/:id/approve', auth, admin, vendorProductController.approveVendorProduct);

// DENY vendor product with reason (admin only)
router.put('/:id/deny', auth, admin, vendorProductController.denyVendorProduct);

// TOGGLE product active status (admin only)
router.put('/:id/toggle-status', auth, admin, vendorProductController.toggleProductStatus);

// TOGGLE featured status (admin only)
router.put('/:id/toggle-featured', auth, admin, vendorProductController.toggleFeaturedStatus);

// UPDATE vendor product
router.put('/:id', auth, vendorProductController.updateVendorProduct);

// GET single vendor product (must come after all specific /:id/* routes)
router.get('/:id', auth, vendorProductController.getVendorProduct);

// TEST route to verify changes are deployed
router.get('/test-reconsider', (req, res) => {
  res.json({ message: 'Reconsider route is available', timestamp: new Date() });
});

// DELETE vendor product (vendors can delete their own, admins can delete any)
router.delete('/:id', auth, vendorProductController.deleteVendorProduct);

module.exports = router;

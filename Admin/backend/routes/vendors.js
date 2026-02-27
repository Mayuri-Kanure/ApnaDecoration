const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/vendors/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all vendors
router.get('/', auth, vendorController.getVendors);

// Get vendor by ID
router.get('/:id', auth, vendorController.getVendorById);

// Create vendor (with file upload support)
router.post('/', auth, authorize('admin', 'manager'), upload.fields([
  { name: 'vendorImage', maxCount: 1 },
  { name: 'shopLogo', maxCount: 1 },
  { name: 'shopBanner', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]), (req, res) => {
  console.log('🔍 Vendors POST route hit');
  console.log('🔍 Request body:', req.body);
  console.log('🔍 Files:', req.files);
  console.log('🔍 Request headers:', req.headers);
  
  vendorController.createVendor(req, res).catch(error => {
    console.error('❌ Vendor creation error in route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  });
});

// Update vendor
router.put('/:id', auth, authorize('admin', 'manager'), vendorController.updateVendor);

// Delete vendor
router.delete('/:id', auth, authorize('admin', 'manager'), vendorController.deleteVendor);

// Verify vendor
router.patch('/:id/verify', auth, authorize('admin', 'manager'), vendorController.verifyVendor);

// Update vendor statistics
router.post('/update-stats', auth, authorize('admin', 'manager'), vendorController.updateVendorStats);

module.exports = router;

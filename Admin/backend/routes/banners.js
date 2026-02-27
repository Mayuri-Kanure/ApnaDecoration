const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { auth, authorize } = require('../middleware/auth');
const cloudinaryService = require('../services/cloudinaryService');

// Configure Cloudinary upload for banners
const upload = cloudinaryService.uploadBannerImages().single('image');

// Public route to get published banners (for User frontend)
router.get('/public', bannerController.getPublicBanners);

// Get all banners (protected)
router.get('/', auth, authorize('admin', 'manager'), bannerController.getBanners);

// Create a new banner (with file upload)
router.post('/', auth, authorize('admin', 'manager'), upload, bannerController.createBanner);

// Update a banner (with file upload)
router.put('/:id', auth, authorize('admin', 'manager'), upload, bannerController.updateBanner);

// Delete a banner
router.delete('/:id', auth, authorize('admin', 'manager'), bannerController.deleteBanner);

// Toggle banner published status
router.patch('/:id/toggle', auth, authorize('admin', 'manager'), bannerController.toggleBannerStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middlewares/serviceCategoryUpload');

// Get all service categories (public and admin)
router.get('/', serviceCategoryController.getServiceCategories);

// Get service category by ID
router.get('/:id', serviceCategoryController.getServiceCategoryById);

// Create service category (admin only)
router.post('/', auth, authorize('admin', 'manager'), upload, serviceCategoryController.createServiceCategory);

// Update service category (admin only)
router.put('/:id', auth, authorize('admin', 'manager'), upload, serviceCategoryController.updateServiceCategory);

// Delete service category (admin only)
router.delete('/:id', auth, authorize('admin', 'manager'), serviceCategoryController.deleteServiceCategory);

// Toggle service category status (admin only)
router.patch('/:id/toggle-status', auth, authorize('admin', 'manager', 'user', 'vendor'), serviceCategoryController.toggleServiceCategoryStatus);

module.exports = router;

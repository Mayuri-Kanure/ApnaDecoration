const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');
const cloudinaryService = require('../services/cloudinaryService');

// Configure Cloudinary upload for categories
const upload = cloudinaryService.uploadCategoryImages();

// Get all categories (public endpoint for user-facing app)
router.get('/', categoryController.getCategories);

// Get category by ID (public endpoint for user-facing app)
router.get('/:id', categoryController.getCategory);

// Create new category
router.post('/', auth, upload, (req, res, next) => {
  console.log('POST /categories route hit');
  next();
}, categoryController.createCategory);

// Update category
router.put('/:id', auth, authorize('admin', 'manager'), upload, categoryController.updateCategory);

// Delete category
router.delete('/:id', auth, categoryController.deleteCategory);

// Toggle category status - temporarily remove authorize for debugging
router.patch('/:id/status', auth, categoryController.toggleCategoryStatus);

// Update category priority
router.patch('/:id/priority', auth, authorize('admin', 'manager'), categoryController.updateCategoryPriority);

module.exports = router;

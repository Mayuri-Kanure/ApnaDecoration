const express = require('express');
const router = express.Router();
const { 
  getAllServices, 
  getFeaturedServices, 
  getServicesByCategory, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { uploadServiceImage, uploadServiceImages } = require('../middleware/serviceUpload');
const { auth } = require('../middleware/auth');

console.log('🔍 Services Routes: Loading modules...');
console.log('🔍 Services Routes: uploadServiceImage:', !!uploadServiceImage);
console.log('🔍 Services Routes: auth:', !!auth);

// Get all services (public endpoint)
router.get('/', getAllServices);

router.get('/featured', getFeaturedServices);

router.get('/category/:categoryId', getServicesByCategory);

router.get('/:id', getServiceById);

// Admin endpoints (protected)
console.log('🔍 Services Routes: Setting up POST route...');
console.log('🔍 Services Routes: auth type:', typeof auth);
console.log('🔍 Services Routes: auth:', auth);
console.log('🔍 Services Routes: uploadServiceImage type:', typeof uploadServiceImage);
console.log('🔍 Services Routes: uploadServiceImage:', uploadServiceImage);
console.log('🔍 Services Routes: createService type:', typeof createService);
console.log('🔍 Services Routes: createService:', createService);
router.post('/', auth, uploadServiceImages, createService);
console.log('🔍 Services Routes: POST route setup complete');

router.put('/:id', auth, uploadServiceImages, updateService);

router.delete('/:id', auth, deleteService);

module.exports = router;

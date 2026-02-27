const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');

// Create uploader for service banner images
const serviceBannerUploader = cloudinaryService.getUploader('apna-decoration/service-banner', 1);

// Create uploader for service product images (multiple)
const serviceProductUploader = cloudinaryService.getUploader('apna-decoration/service-product', 5);

// Middleware for single banner image upload
const uploadServiceImage = serviceBannerUploader.single('bannerImage');

// Middleware for multiple service images (banner + additional images)
const uploadServiceImages = serviceProductUploader.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'images', maxCount: 4 }
]);

module.exports = {
  uploadServiceImage,
  uploadServiceImages
};

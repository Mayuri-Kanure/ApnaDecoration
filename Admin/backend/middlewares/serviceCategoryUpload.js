const cloudinaryService = require('../services/cloudinaryService');

// Use Cloudinary service for uploads - get the raw Multer instance
const upload = cloudinaryService.getUploader('service-categories', 1).single('categoryImage');

module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinaryService = require('../services/cloudinaryService');

// Use Cloudinary service for uploads
const upload = cloudinaryService.getUploader('orders', 5);

// Ensure upload directory exists (fallback)
const uploadDir = path.join(__dirname, '../uploads/orders');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Local upload fallback (if Cloudinary is not configured)
const localUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  }
});

// Export Cloudinary upload (with local fallback)
module.exports = upload;

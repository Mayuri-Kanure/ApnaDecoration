const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinaryService = require('../services/cloudinaryService');

// Use Cloudinary service for vendor uploads
const cloudinaryUpload = cloudinaryService.getUploader('vendor-products', 5);

// Ensure vendor upload directory exists (fallback)
const uploadDir = path.join(__dirname, '../uploads/vendor-products');
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
    files: 5 // Maximum 5 files for vendor products
  }
});

// Add debugging middleware
const debugUpload = (req, res, next) => {
  console.log('🔍 Middleware - DEBUG UPLOAD CALLED!');
  console.log('🔍 Middleware - Request headers:', req.headers);
  console.log('🔍 Middleware - Content-Type:', req.headers['content-type']);
  console.log('🔍 Middleware - Request method:', req.method);
  console.log('🔍 Middleware - Request URL:', req.originalUrl);
  console.log('🔍 Middleware - Request path:', req.path);
  next();
};

// Export configurations with Cloudinary
const uploadVendorImages = [
  debugUpload,
  cloudinaryUpload.array('images', 5),
  (req, res, next) => {
    console.log('🔍 Middleware - Files after upload:', req.files);
    console.log('🔍 Middleware - Number of files:', req.files?.length || 0);
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`🔍 Middleware - File ${index}:`, {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size
        });
      });
    }
    next();
  }
];

const uploadVendorImage = cloudinaryUpload.single('image');

// Fallback local upload (for development)
const upload = localUpload;

module.exports = { upload, uploadVendorImages, uploadVendorImage, debugUpload };

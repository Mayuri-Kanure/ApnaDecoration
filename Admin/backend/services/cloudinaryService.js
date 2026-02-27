const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  constructor() {
    this.folder = process.env.CLOUDINARY_FOLDER || 'apna-decoration';
    this.isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && 
                                   process.env.CLOUDINARY_API_KEY && 
                                   process.env.CLOUDINARY_API_SECRET);
    
    if (this.isCloudinaryConfigured) {
      console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
    } else {
      console.warn('⚠️ Cloudinary not configured, using local storage');
    }
  }

  // Initialize Cloudinary storage for multer
  getStorage(folder = '') {
    if (!this.isCloudinaryConfigured) {
      // Fallback to local storage
      return multer.diskStorage({
        destination: function (req, file, cb) {
          const uploadDir = path.join(__dirname, '..', 'uploads', folder);
          if (!require('fs').existsSync(uploadDir)) {
            require('fs').mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      });
    }

    try {
      // Cloudinary storage
      return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: `${this.folder}/${folder}`,
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
          public_id: (req, file) => {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 8);
            return `${timestamp}-${randomString}`;
          },
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        }
      });
    } catch (error) {
      console.error('❌ CloudinaryStorage configuration error:', error);
      // Fallback to local storage
      return multer.diskStorage({
        destination: function (req, file, cb) {
          const uploadDir = path.join(__dirname, '..', 'uploads', folder);
          // Create directory if it doesn't exist
          if (!require('fs').existsSync(uploadDir)) {
            require('fs').mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      });
    }
  }

  // Get multer instance with Cloudinary storage
  getUploader(folder = 'general', maxFiles = 1) {
    const storage = this.getStorage(folder);
    return multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: maxFiles,
        fieldSize: 20 * 1024 * 1024, // 20MB for field size
        fields: 50, // Max 50 fields
        fieldNameSize: 100 // Max field name size
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and AVIF are allowed.'), false);
        }
      }
    });
  }

  // Upload single image
  uploadSingle(folder = 'general') {
    return this.getUploader(folder, 1).single('image');
  }

  // Upload multiple images
  uploadMultiple(folder = 'general', maxCount = 5) {
    return this.getUploader(folder, maxCount).array('images', maxCount);
  }

  // Upload product images (main + additional)
  uploadProductImages() {
    return this.getUploader('products', 10).fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 9 },
      { name: 'meta_image', maxCount: 1 }
    ]);
  }

  // Upload banner images
  uploadBannerImages() {
    return this.getUploader('banners', 1);
  }

  // Upload category images with subfolder
  uploadCategoryImages() {
    return this.getUploader('categories', 1).single('image');
  }

  // Upload service category images with subfolder
  uploadServiceCategoryImages() {
    return this.getUploader('service-categories', 1).single('image');
  }

  // Upload user avatars
  uploadAvatar() {
    return this.getUploader('avatars', 1).single('avatar');
  }

  // Delete image from Cloudinary
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.includes('cloudinary')) {
        console.log('⚠️ Not a Cloudinary URL, skipping deletion');
        return { success: true, message: 'Not a Cloudinary URL' };
      }

      // Extract public_id from URL
      const urlParts = imageUrl.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const publicId = filenameWithExtension.split('.')[0];
      
      // Include folder in public_id
      const folderPath = urlParts.slice(-2, -1).join('/');
      const fullPublicId = `${folderPath}/${publicId}`;

      const result = await cloudinary.uploader.destroy(fullPublicId);
      console.log(`🗑️ Deleted image: ${fullPublicId}`);
      
      return { 
        success: true, 
        message: 'Image deleted successfully',
        result: result 
      };
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  // Test Cloudinary connection
  async testConnection() {
    try {
      const result = await cloudinary.api.ping();
      return { 
        success: true, 
        message: 'Cloudinary connection successful',
        data: result 
      };
    } catch (error) {
      console.error('❌ Cloudinary connection failed:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
}

module.exports = new CloudinaryService();

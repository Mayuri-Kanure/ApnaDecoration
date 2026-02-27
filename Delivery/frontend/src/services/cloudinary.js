// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'drrlkntpx';
const CLOUDINARY_API_KEY = '172939738516976';
const CLOUDINARY_API_SECRET = 'Mbjo37JLZ4kefxLaBavJY2eweMQ';
const CLOUDINARY_FOLDER = 'apna-decoration/delivery-boy';

// Cloudinary Upload Service
class CloudinaryService {
  constructor() {
    this.cloudName = CLOUDINARY_CLOUD_NAME;
    this.apiKey = CLOUDINARY_API_KEY;
    this.folder = CLOUDINARY_FOLDER;
  }

  // Upload file to Cloudinary
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Use unsigned upload preset
    formData.append('folder', this.folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        resourceType: data.resource_type,
        ...data
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, options = {}) {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = this.generateDeleteSignature(publicId, timestamp);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', this.apiKey);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.result !== 'ok') {
        throw new Error('Delete failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  // Generate signature for deletion
  generateDeleteSignature(publicId, timestamp) {
    const crypto = require('crypto');
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    return crypto
      .createHmac('sha1', CLOUDINARY_API_SECRET)
      .update(stringToSign)
      .digest('hex');
  }

  // Get optimized image URL
  getOptimizedUrl(publicId, options = {}) {
    const {
      width = 'auto',
      height = 'auto',
      quality = 'auto',
      format = 'auto',
      crop = 'limit'
    } = options;

    const transformations = [];
    
    if (width !== 'auto') transformations.push(`w_${width}`);
    if (height !== 'auto') transformations.push(`h_${height}`);
    if (quality !== 'auto') transformations.push(`q_${quality}`);
    if (format !== 'auto') transformations.push(`f_${format}`);
    if (crop !== 'limit') transformations.push(`c_${crop}`);

    const transformationString = transformations.join(',');
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  // Get thumbnail URL
  getThumbnailUrl(publicId, width = 200, height = 200) {
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      quality: 'auto',
      crop: 'thumb'
    });
  }

  // Validate file type
  validateFileType(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    return allowedTypes.includes(file.type);
  }

  // Validate file size (max 5MB)
  validateFileSize(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  }

  // Get file validation error
  getFileValidationError(file) {
    if (!this.validateFileType(file)) {
      return 'Invalid file type. Only images and PDFs are allowed.';
    }

    if (!this.validateFileSize(file)) {
      return 'File size must be less than 5MB.';
    }

    return null;
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export default cloudinaryService;

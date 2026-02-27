// Global configuration for USER APP
// Use Admin backend for products and service categories since it has Cloudinary URLs
export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com') + '/api';
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'https://admin-api.apnadecoration.com';

// Product API uses Admin backend directly (temporary fix)
export const PRODUCT_API_URL = process.env.REACT_APP_PRODUCT_API_URL || 'https://admin-api.apnadecoration.com/api';

// Service Category API uses Admin backend (has Cloudinary URLs)
export const SERVICE_CATEGORY_API_URL = process.env.REACT_APP_SERVICE_CATEGORY_API_URL || 'https://admin-api.apnadecoration.com/api';

// Debug: Show current configuration
console.log('🔗 API CONFIGURATION:', {
  API_BASE_URL: (process.env.REACT_APP_API_BASE_URL || 'https://user-api.apnadecoration.com') + '/api',
  IMAGE_BASE_URL: process.env.REACT_APP_IMAGE_BASE_URL || 'https://admin-api.apnadecoration.com',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

// App specific constants
export const APP_TYPE = process.env.REACT_APP_APP_TYPE || 'USER';
export const APP_VERSION = process.env.REACT_APP_APP_VERSION || '1.0.0';

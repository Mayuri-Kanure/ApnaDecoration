const express = require('express');
const router = express.Router();
const deliveryBoyController = require('../controllers/deliveryBoyController');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drrlkntpx',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apna-decoration/delivery-men/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'limit', quality: 'auto' }
    ]
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `delivery-boy-${uniqueSuffix}`);
  }
});

const upload = require('multer')({ storage: storage });

// Create delivery boy
router.post('/', [
  auth,
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('address.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .notEmpty()
    .withMessage('State is required'),
  body('address.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Invalid pincode format'),
  body('vehicleType')
    .optional()
    .isIn(['bike', 'scooter', 'van', 'truck', 'car'])
    .withMessage('Invalid vehicle type'),
  body('vehicleNumber')
    .optional()
    .isString()
    .withMessage('Vehicle number must be a string'),
  body('licenseNumber')
    .optional()
    .isString()
    .withMessage('License number must be a string')
], deliveryBoyController.createDeliveryBoy);

// Login delivery boy
router.post('/login', [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], deliveryBoyController.loginDeliveryBoy);

// Get all delivery boys
router.get('/', [
  auth
], deliveryBoyController.getAllDeliveryBoys);

// Get delivery boy profile
router.get('/profile', [
  auth
], deliveryBoyController.getProfile);

// Update delivery boy profile
router.put('/profile', [
  auth
], deliveryBoyController.updateProfile);

// Update delivery boy availability
router.put('/availability', [
  auth
], deliveryBoyController.updateAvailability);

// Upload profile image
router.post('/upload-profile-image', [
  auth,
  upload.single('profileImage')
], deliveryBoyController.uploadProfileImage);

// Get earnings data
router.get('/earnings', [
  auth
], deliveryBoyController.getEarnings);

// Get earnings statistics
router.get('/earnings/stats', [
  auth
], deliveryBoyController.getEarningsStats);

// Request withdrawal
router.post('/withdrawal', [
  auth,
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than 0')
], deliveryBoyController.requestWithdrawal);

// Get available delivery boys
router.get('/available/list', deliveryBoyController.getAvailableDeliveryBoys);

// Get delivery boys by location
router.get('/location/nearby', deliveryBoyController.getDeliveryBoysByLocation);

// Get delivery boy statistics
router.get('/statistics/all', [
  auth
], deliveryBoyController.getDeliveryBoyStatistics);

// Search delivery boys
router.get('/search/query', deliveryBoyController.searchDeliveryBoys);

// Get delivery boy settings
router.get('/settings', [
  auth
], deliveryBoyController.getSettings);

// Update delivery boy settings
router.put('/settings', [
  auth
], deliveryBoyController.updateSettings);

// Change password
router.put('/change-password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], deliveryBoyController.changePassword);

// Delete account
router.delete('/account', [
  auth
], deliveryBoyController.deleteAccount);

// Get delivery boy by ID
router.get('/:id', deliveryBoyController.getDeliveryBoyById);

// Update delivery boy
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('address.street')
    .optional()
    .isString()
    .withMessage('Street address must be a string'),
  body('address.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  body('address.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  body('address.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Invalid pincode format'),
  body('vehicleType')
    .optional()
    .isIn(['bike', 'scooter', 'van', 'truck', 'car'])
    .withMessage('Invalid vehicle type'),
  body('vehicleNumber')
    .optional()
    .isString()
    .withMessage('Vehicle number must be a string'),
  body('licenseNumber')
    .optional()
    .isString()
    .withMessage('License number must be a string')
], deliveryBoyController.updateDeliveryBoy);

// Delete delivery boy
router.delete('/:id', [
  auth
], deliveryBoyController.deleteDeliveryBoy);

// Update availability
router.put('/:id/availability', [
  auth,
  body('isAvailable')
    .notEmpty()
    .withMessage('isAvailable is required')
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('currentLocation')
    .optional()
    .isString()
    .withMessage('Current location must be a string'),
  body('coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object')
], deliveryBoyController.updateAvailability);

// Get available delivery boys
router.get('/available/list', deliveryBoyController.getAvailableDeliveryBoys);

// Get delivery boys by location
router.get('/location/nearby', deliveryBoyController.getDeliveryBoysByLocation);

// Update performance metrics
router.put('/:id/performance', [
  auth,
  body('deliveryStatus')
    .notEmpty()
    .withMessage('Delivery status is required')
    .isIn(['delivered', 'failed'])
    .withMessage('Invalid delivery status'),
  body('deliveryTime')
    .optional()
    .isNumeric()
    .withMessage('Delivery time must be a number')
], deliveryBoyController.updatePerformanceMetrics);

// Add rating
router.post('/:id/rating', [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
], deliveryBoyController.addRating);

// Get performance report
router.get('/:id/performance-report', deliveryBoyController.getPerformanceReport);

module.exports = router;

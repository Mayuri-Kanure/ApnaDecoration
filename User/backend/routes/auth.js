const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const cloudinaryService = require('../services/cloudinaryService');

const router = express.Router();

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile (protected)
router.get('/profile', authMiddleware, authController.getCurrentUser);

// Update user profile (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

// Upload profile image (protected)
router.post('/upload-profile-image', authMiddleware, (req, res, next) => {
  console.log('🔍 Profile image upload route hit');
  next();
}, cloudinaryService.uploadAvatar(), (req, res, next) => {
  console.log('🔍 After multer middleware, file:', req.file);
  next();
}, authController.uploadProfileImage);

// Change password (protected)
router.put('/change-password', authMiddleware, authController.changePassword);

// Toggle 2FA (protected)
router.post('/toggle-2fa', authMiddleware, authController.toggle2FA);

module.exports = router;
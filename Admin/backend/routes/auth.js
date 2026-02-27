const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Login
router.post('/login', validateLogin, authController.login);

// Register
router.post('/register', validateRegister, authController.register);

// Get profile (protected)
router.get('/profile', auth, authController.getProfile);

// Update profile (protected)
router.put('/profile', auth, authController.updateProfile);

// Validation for security endpoints
const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('newPassword').notEmpty().withMessage('New password is required')
];

const validateTwoFactor = [
  body('enabled').isBoolean().withMessage('Enabled status must be a boolean')
];

// Change password (protected)
router.put('/change-password', auth, validatePasswordChange, authController.changePassword);

// Toggle two-factor authentication (protected)
router.put('/toggle-2fa', auth, validateTwoFactor, authController.toggleTwoFactor);

module.exports = router;

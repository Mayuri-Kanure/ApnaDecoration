const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Get Google OAuth URL
router.get('/auth-url', googleAuthController.getGoogleAuthUrl);

// Handle Google OAuth callback (for server-side flow)
router.get('/callback', googleAuthController.googleCallback);

// Handle Google login from frontend (token-based)
router.post('/login', [
  body('googleToken').notEmpty().withMessage('Google token is required')
], googleAuthController.googleLogin);

// Link Google account to existing user (protected)
router.post('/link', auth, [
  body('googleToken').notEmpty().withMessage('Google token is required')
], googleAuthController.linkGoogleAccount);

// Unlink Google account (protected)
router.post('/unlink', auth, googleAuthController.unlinkGoogleAccount);

module.exports = router;

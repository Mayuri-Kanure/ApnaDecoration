const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register new vendor
router.post('/register', authController.register);

// Login vendor
router.post('/login', authController.login);

// Get current vendor profile (protected)
router.get('/profile', authMiddleware, authController.getCurrentUser);

// Update vendor profile (protected)
router.put('/profile', authMiddleware, authController.updateProfile);

// Change password (protected)
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;

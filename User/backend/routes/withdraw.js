const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const { auth } = require('../middleware/auth');

// Create withdraw request
router.post('/', auth, withdrawController.createWithdrawRequest);

// Get user's withdraw requests
router.get('/', auth, withdrawController.getUserWithdraws);

// Get withdraw request by ID
router.get('/:id', auth, withdrawController.getWithdrawById);

// Cancel withdraw request
router.patch('/:id/cancel', auth, withdrawController.cancelWithdrawRequest);

module.exports = router;

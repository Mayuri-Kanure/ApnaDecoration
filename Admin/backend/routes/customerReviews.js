const express = require('express');
const router = express.Router();
const customerReviewController = require('../controllers/customerReviewController');
const { auth, authorize } = require('../middleware/auth');

// Get all customer reviews
router.get('/', auth, customerReviewController.getCustomerReviews);

// Add customer review
router.post('/', auth, customerReviewController.addCustomerReview);

// Reply to review
router.post('/:id/reply', auth, authorize('admin', 'manager'), customerReviewController.replyToReview);

// Update review status
router.patch('/:id/status', auth, authorize('admin', 'manager'), customerReviewController.updateReviewStatus);

module.exports = router;

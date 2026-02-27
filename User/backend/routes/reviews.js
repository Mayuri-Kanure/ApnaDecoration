const express = require('express');
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Public product reviews
router.get('/product/:productId', reviewController.getReviews);

// Protected review routes
router.use(auth);
router.get('/user/:productId', reviewController.getMyReviewForProduct);
router.post('/', reviewController.createReview);
router.patch('/:id/helpful', reviewController.markHelpful);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;

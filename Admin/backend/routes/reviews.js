const express = require('express');
const router = express.Router();
const CustomerReview = require('../models/CustomerReview');
const { auth } = require('../middleware/auth');

// Get all reviews (for admin panel) - temporarily public for testing
router.get('/', async (req, res) => {
  try {
    const { search, rating, status, productId, customerId, date, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (productId) {
      query.productId = productId;
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Get reviews with pagination (no populate to avoid model issues)
    const reviews = await CustomerReview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await CustomerReview.countDocuments(query);
    
    // Calculate stats
    const stats = await CustomerReview.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    const ratingStats = stats[0] || { avgRating: 0, totalReviews: 0, ratingDistribution: [] };
    const distribution = [0, 0, 0, 0, 0];
    ratingStats.ratingDistribution.forEach(rating => {
      if (rating >= 1 && rating <= 5) {
        distribution[rating - 1]++;
      }
    });
    
    res.json({
      success: true,
      reviews: reviews,  // Changed from 'data' to 'reviews'
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalReviews: ratingStats.totalReviews,
        averageRating: Math.round(ratingStats.avgRating * 10) / 10,
        ratingDistribution: distribution
      }
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const DeliveryRating = require('../models/DeliveryRating');
const DeliveryOrder = require('../models/DeliveryOrder');
const DeliveryBoy = require('../models/DeliveryBoy');
const auth = require('../middleware/deliveryAuth');
const { body, validationResult } = require('express-validator');

// Get ratings for delivery boy
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      deliveryBoyId: req.deliveryBoy.id,
      isVerified: true
    };

    if (rating) {
      query['rating.overall'] = parseInt(rating);
    }

    const ratings = await DeliveryRating.find(query)
      .populate('customerId', 'name')
      .populate('deliveryOrderId', 'orderId deliveredDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryRating.countDocuments(query);

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get rating summary
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await DeliveryRating.getAverageRating(req.deliveryBoy.id);

    // Get rating distribution
    const distribution = await DeliveryRating.aggregate([
      {
        $match: {
          deliveryBoyId: req.deliveryBoy.id,
          isVerified: true
        }
      },
      {
        $group: {
          _id: '$rating.overall',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': -1 } }
    ]);

    // Get recent tags
    const recentTags = await DeliveryRating.aggregate([
      {
        $match: {
          deliveryBoyId: req.deliveryBoy.id,
          isVerified: true,
          tags: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        summary,
        distribution,
        tags: recentTags
      }
    });
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Respond to a rating
router.post('/:ratingId/response', [
  auth,
  body('response').trim().isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { ratingId } = req.params;
    const { response } = req.body;

    const rating = await DeliveryRating.findOne({
      _id: ratingId,
      deliveryBoyId: req.deliveryBoy.id
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    await rating.addDeliveryBoyResponse(response);

    res.json({
      success: true,
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Customer submits rating (public endpoint)
router.post('/', [
  body('deliveryOrderId').isMongoId(),
  body('rating.deliverySpeed').isInt({ min: 1, max: 5 }),
  body('rating.behavior').isInt({ min: 1, max: 5 }),
  body('rating.serviceQuality').isInt({ min: 1, max: 5 }),
  body('rating.overall').isInt({ min: 1, max: 5 }),
  body('review').optional().trim().isLength({ max: 500 }),
  body('tags').optional().isArray(),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { deliveryOrderId, rating, review, tags, isAnonymous } = req.body;

    // Verify order exists and is delivered
    const order = await DeliveryOrder.findOne({
      _id: deliveryOrderId,
      status: 'delivered'
    }).populate('customerId deliveryBoyId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not delivered'
      });
    }

    // Check if rating already exists
    const existingRating = await DeliveryRating.findOne({
      deliveryOrderId,
      customerId: order.customerId._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Rating already submitted for this order'
      });
    }

    // Create rating
    const newRating = new DeliveryRating({
      deliveryOrderId,
      deliveryBoyId: order.deliveryBoyId._id,
      customerId: order.customerId._id,
      rating,
      review,
      tags: tags || [],
      isAnonymous: isAnonymous || false
    });

    await newRating.save();

    // Update delivery boy's average rating
    const avgRating = await DeliveryRating.getAverageRating(order.deliveryBoyId._id);
    await DeliveryBoy.findByIdAndUpdate(order.deliveryBoyId._id, {
      averageRating: avgRating.avgOverall
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get rating trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate, endDate, groupBy;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }

    const trends = await DeliveryRating.aggregate([
      {
        $match: {
          deliveryBoyId: req.deliveryBoy.id,
          isVerified: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          avgOverall: { $avg: "$rating.overall" },
          avgSpeed: { $avg: "$rating.deliverySpeed" },
          avgBehavior: { $avg: "$rating.behavior" },
          avgServiceQuality: { $avg: "$rating.serviceQuality" },
          totalRatings: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching rating trends:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

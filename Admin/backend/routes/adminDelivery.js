const express = require('express');
const router = express.Router();
const DeliveryOrder = require('../models/DeliveryOrder');
const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryTracking = require('../models/DeliveryTracking');
const DeliveryNotification = require('../models/DeliveryNotification');
const DeliveryRating = require('../models/DeliveryRating');
const DeliveryWithdraw = require('../models/DeliveryWithdraw');
const DeliveryZone = require('../models/DeliveryZone');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get delivery dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const stats = await Promise.all([
      DeliveryOrder.countDocuments({ status: 'pending' }),
      DeliveryOrder.countDocuments({ status: 'assigned' }),
      DeliveryOrder.countDocuments({ status: 'in_transit' }),
      DeliveryOrder.countDocuments({ status: 'delivered' }),
      DeliveryOrder.countDocuments({ status: 'failed' }),
      DeliveryBoy.countDocuments({ availability: true }),
      DeliveryBoy.countDocuments({ availability: false }),
    ]);

    const recentOrders = await DeliveryOrder.find()
      .populate('deliveryBoyId', 'firstName lastName phone')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          pendingOrders: stats[0],
          assignedOrders: stats[1],
          inTransitOrders: stats[2],
          deliveredOrders: stats[3],
          failedOrders: stats[4],
          activeDeliveryBoys: stats[5],
          inactiveDeliveryBoys: stats[6],
        },
        recentOrders,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all delivery boys
router.get('/delivery-boys', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, availability } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (availability) query.availability = availability === 'true';

    const deliveryBoys = await DeliveryBoy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryBoy.countDocuments(query);

    res.json({
      success: true,
      data: {
        deliveryBoys,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching delivery boys:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all delivery orders
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const orders = await DeliveryOrder.find(query)
      .populate('deliveryBoyId', 'firstName lastName phone')
      .populate('customerId', 'name phone')
      .populate('vendorId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Assign order to delivery boy
router.post('/orders/:orderId/assign', [
  auth,
  body('deliveryBoyId').isMongoId().withMessage('Valid delivery boy ID is required')
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

    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;

    // Check if order exists and is pending
    const order = await DeliveryOrder.findOne({
      _id: orderId,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not available for assignment'
      });
    }

    // Check if delivery boy exists and is available
    const deliveryBoy = await DeliveryBoy.findOne({
      _id: deliveryBoyId,
      availability: true
    });

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found or not available'
      });
    }

    // Assign order
    order.deliveryBoyId = deliveryBoyId;
    order.status = 'assigned';
    order.assignedDate = new Date();
    await order.save();

    // Create notification for delivery boy
    await createNotification(
      deliveryBoyId,
      'DeliveryBoy',
      'New Order Assigned',
      `Order ${order.orderId} has been assigned to you`,
      'order_assigned',
      'normal',
      {
        deliveryOrderId: order._id
      }
    );

    res.json({
      success: true,
      message: 'Order assigned successfully',
      data: order
    });
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get live tracking for all active deliveries
router.get('/live-tracking', auth, async (req, res) => {
  try {
    const activeTracking = await DeliveryTracking.find({ isActive: true })
      .populate('deliveryOrderId', 'orderId customerName deliveryAddress')
      .populate('deliveryBoyId', 'firstName lastName phone currentLocation');

    res.json({
      success: true,
      data: activeTracking
    });
  } catch (error) {
    console.error('Error fetching live tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get delivery analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
    }

    // Order statistics
    const orderStats = await DeliveryOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Delivery boy performance
    const topPerformers = await DeliveryBoy.aggregate([
      {
        $lookup: {
          from: 'deliveryorders',
          localField: '_id',
          foreignField: 'deliveryBoyId',
          as: 'orders'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          totalDeliveries: { $size: '$orders' },
          successfulDeliveries: {
            $size: {
              $filter: {
                input: '$orders',
                cond: { $eq: ['$$this.status', 'delivered'] }
              }
            }
          },
          averageRating: 1
        }
      },
      {
        $addFields: {
          successRate: {
            $cond: [
              { $eq: ['$totalDeliveries', 0] },
              0,
              { $multiply: [{ $divide: ['$successfulDeliveries', '$totalDeliveries'] }, 100] }
            ]
          }
        }
      },
      { $sort: { successfulDeliveries: -1 } },
      { $limit: 10 }
    ]);

    // Zone performance
    const zoneStats = await DeliveryZone.aggregate([
      {
        $lookup: {
          from: 'deliveryorders',
          let: { zoneId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $geoIntersects: {
                    $geometry: '$$zoneId.boundaries',
                  }
                }
              }
            }
          ],
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          orderCount: { $size: '$orders' },
          deliveryFee: { $sum: '$orders.deliveryFee' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        orderStats,
        topPerformers,
        zoneStats,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get withdrawal requests
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const withdrawals = await DeliveryWithdraw.find(query)
      .populate('deliveryBoyId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryWithdraw.countDocuments(query);

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Approve/reject withdrawal
router.patch('/withdrawals/:withdrawalId/status', [
  auth,
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('notes').optional().trim().isLength({ max: 500 })
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

    const { withdrawalId } = req.params;
    const { status, notes } = req.body;

    const withdrawal = await DeliveryWithdraw.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal already processed'
      });
    }

    withdrawal.status = status;
    withdrawal.notes = notes;
    withdrawal.processedBy = req.admin.id;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Create notification for delivery boy
    await createNotification(
      withdrawal.deliveryBoyId,
      'DeliveryBoy',
      `Withdrawal ${status}`,
      `Your withdrawal request of ₹${withdrawal.amount} has been ${status}`,
      status === 'approved' ? 'earning_updated' : 'system_alert',
      status === 'approved' ? 'normal' : 'warning',
      {
        amount: withdrawal.amount,
        withdrawalId: withdrawal._id
      }
    );

    res.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      data: withdrawal
    });
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get delivery zones
router.get('/zones', auth, async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ isActive: true })
      .populate('deliveryBoys.deliveryBoyId', 'firstName lastName phone')
      .sort({ priority: 1 });

    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create delivery zone
router.post('/zones', [
  auth,
  body('name').trim().notEmpty().withMessage('Zone name is required'),
  body('code').trim().notEmpty().withMessage('Zone code is required'),
  body('deliveryFee').isFloat({ min: 0 }).withMessage('Valid delivery fee is required'),
  body('estimatedTime').isInt({ min: 0 }).withMessage('Valid estimated time is required'),
  body('boundaries').isObject().withMessage('Zone boundaries are required')
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

    const zone = new DeliveryZone(req.body);
    await zone.save();

    res.status(201).json({
      success: true,
      message: 'Delivery zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get ratings and feedback
router.get('/ratings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, deliveryBoyId } = req.query;
    const skip = (page - 1) * limit;

    let query = { isVerified: true };
    if (rating) query['rating.overall'] = parseInt(rating);
    if (deliveryBoyId) query.deliveryBoyId = deliveryBoyId;

    const ratings = await DeliveryRating.find(query)
      .populate('deliveryBoyId', 'firstName lastName')
      .populate('customerId', 'name')
      .populate('deliveryOrderId', 'orderId')
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

// Helper function to create notifications
async function createNotification(recipientId, recipientType, title, message, type, priority, data = {}) {
  try {
    const notification = new DeliveryNotification({
      recipientId,
      recipientType,
      title,
      message,
      type,
      priority,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = router;

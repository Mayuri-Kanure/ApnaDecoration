const express = require('express');
const router = express.Router();
const DeliveryOrder = require('../models/DeliveryOrder');
const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryWithdraw = require('../models/DeliveryWithdraw');
const auth = require('../middleware/deliveryAuth');
const { body, validationResult } = require('express-validator');

// Get earnings summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 7));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Get completed orders in the period
    const completedOrders = await DeliveryOrder.find({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'delivered',
      deliveredDate: { $gte: startDate, $lt: endDate }
    });

    // Calculate earnings
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryBoyEarnings || 0), 0);
    const totalOrders = completedOrders.length;
    const averageEarningPerOrder = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    // Get pending withdrawals
    const pendingWithdrawals = await DeliveryWithdraw.find({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'pending'
    });

    const pendingAmount = pendingWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Get total withdrawn amount
    const withdrawnOrders = await DeliveryWithdraw.find({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'approved'
    });

    const totalWithdrawn = withdrawnOrders.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Get current balance
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    const currentBalance = (deliveryBoy.totalEarnings || 0) - totalWithdrawn - pendingAmount;

    res.json({
      success: true,
      data: {
        period,
        totalEarnings,
        totalOrders,
        averageEarningPerOrder,
        currentBalance,
        pendingWithdrawals: pendingAmount,
        totalWithdrawn,
        orders: completedOrders.map(order => ({
          orderId: order.orderId,
          amount: order.deliveryBoyEarnings,
          date: order.deliveredDate,
          customerName: order.customerName
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get detailed earnings history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      deliveryBoyId: req.deliveryBoy.id,
      status: 'delivered'
    };

    if (startDate || endDate) {
      query.deliveredDate = {};
      if (startDate) query.deliveredDate.$gte = new Date(startDate);
      if (endDate) query.deliveredDate.$lte = new Date(endDate);
    }

    const orders = await DeliveryOrder.find(query)
      .select('orderId customerName totalAmount deliveryBoyEarnings deliveredDate deliveryFee')
      .sort({ deliveredDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryOrder.countDocuments(query);

    // Calculate totals
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryBoyEarnings || 0), 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      data: {
        orders,
        summary: {
          totalEarnings,
          totalOrders,
          averageEarningPerOrder: totalOrders > 0 ? totalEarnings / totalOrders : 0
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching earnings history:', error);
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

    let query = { deliveryBoyId: req.deliveryBoy.id };
    if (status) {
      query.status = status;
    }

    const withdrawals = await DeliveryWithdraw.find(query)
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

// Request withdrawal
router.post('/withdraw', [
  auth,
  body('amount').isFloat({ min: 100, max: 50000 }),
  body('bankDetails').optional().isObject(),
  body('notes').optional().isLength({ max: 500 })
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

    const { amount, bankDetails, notes } = req.body;

    // Get delivery boy info
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    
    // Calculate current balance
    const approvedWithdrawals = await DeliveryWithdraw.find({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'approved'
    });

    const totalWithdrawn = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const currentBalance = (deliveryBoy.totalEarnings || 0) - totalWithdrawn;

    // Check if sufficient balance
    if (amount > currentBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Check minimum withdrawal amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
    }

    // Create withdrawal request
    const withdrawal = new DeliveryWithdraw({
      deliveryBoyId: req.deliveryBoy.id,
      amount,
      bankDetails: bankDetails || deliveryBoy.bankDetails,
      notes,
      status: 'pending'
    });

    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get earnings analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate, endDate, groupBy;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$deliveredDate" } };
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m", date: "$deliveredDate" } };
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y", date: "$deliveredDate" } };
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        endDate = new Date();
        groupBy = { $dateToString: { format: "%Y-%m", date: "$deliveredDate" } };
    }

    // Get earnings grouped by period
    const earningsByPeriod = await DeliveryOrder.aggregate([
      {
        $match: {
          deliveryBoyId: req.deliveryBoy.id,
          status: 'delivered',
          deliveredDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalEarnings: { $sum: "$deliveryBoyEarnings" },
          totalOrders: { $sum: 1 },
          averageEarning: { $avg: "$deliveryBoyEarnings" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get performance metrics
    const totalDeliveries = await DeliveryOrder.countDocuments({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'delivered'
    });

    const failedDeliveries = await DeliveryOrder.countDocuments({
      deliveryBoyId: req.deliveryBoy.id,
      status: 'failed'
    });

    const successRate = totalDeliveries > 0 ? ((totalDeliveries / (totalDeliveries + failedDeliveries)) * 100) : 0;

    res.json({
      success: true,
      data: {
        earningsByPeriod,
        metrics: {
          totalDeliveries,
          failedDeliveries,
          successRate: successRate.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching earnings analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

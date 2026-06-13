const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryWithdraw = require('../models/DeliveryWithdraw');

// @desc    Request withdrawal
// @route   POST /api/delivery-boy/withdrawals
// @access  Private
exports.requestWithdrawal = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Amount and method are required'
      });
    }

    const withdrawalAmount = Number(amount);

    if (withdrawalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount'
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    const availableBalance = deliveryBoy.availableBalance || 0;

    if (withdrawalAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Save withdrawal request to database
    const withdrawal = new DeliveryWithdraw({
      withdrawId: `WD-${String(Date.now()).slice(-6)}`,
      deliveryId: deliveryBoyId,
      deliveryName: `${deliveryBoy.firstName || ''} ${deliveryBoy.lastName || ''}`.trim(),
      deliveryEmail: deliveryBoy.email,
      amount: withdrawalAmount,
      withdrawMethod: method,
      methodDetails: {
        bankName: deliveryBoy.bankDetails?.bankName,
        accountNumber: deliveryBoy.bankDetails?.bankAccount,
        ifscCode: deliveryBoy.bankDetails?.ifscCode,
        accountHolderName: deliveryBoy.bankDetails?.accountHolderName
      },
      status: 'pending',
      netAmount: withdrawalAmount,
      transactionId: `TXN${String(Date.now()).slice(-9)}`,
      createdBy: deliveryBoyId
    });

    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    });

  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get withdrawal history
// @route   GET /api/delivery-boy/withdrawals
// @access  Private
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const withdrawals = await DeliveryWithdraw.find({ deliveryId: deliveryBoyId })
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await DeliveryWithdraw.countDocuments({ deliveryId: deliveryBoyId });

    res.json({
      success: true,
      withdrawals,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get withdrawal stats
// @route   GET /api/delivery-boy/withdrawals/stats
// @access  Private
exports.getWithdrawalStats = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy.id;

    const stats = await DeliveryWithdraw.aggregate([
      { $match: { deliveryId: deliveryBoyId } },
      { $group: {
        _id: null,
        totalWithdrawals: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        },
        approvedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        rejectedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] }
        }
      }}
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalWithdrawals: 0,
        totalAmount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        completedAmount: 0,
        rejectedAmount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
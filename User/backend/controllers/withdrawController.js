const Withdraw = require('../models/Withdraw');
const User = require('../models/User');

// Create withdraw request (for users)
exports.createWithdrawRequest = async (req, res) => {
  try {
    const { amount, withdrawMethod, methodDetails, notes } = req.body;
    const userId = req.user.userId;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Validate minimum withdrawal amount
    if (amount < 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimum withdrawal amount is ₹100' 
      });
    }

    // Create withdraw request
    const withdraw = new Withdraw({
      userId,
      userName: user.name || user.email,
      userEmail: user.email,
      amount,
      netAmount: amount,
      withdrawMethod,
      methodDetails,
      notes
    });

    await withdraw.save();

    res.status(201).json({
      success: true,
      message: 'Withdraw request created successfully',
      data: withdraw
    });
  } catch (error) {
    console.error('Error creating withdraw request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get user's withdraw requests
exports.getUserWithdraws = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = { userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const withdraws = await Withdraw.find(query)
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Withdraw.countDocuments(query);

    res.json({
      success: true,
      data: withdraws,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user withdraws:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get withdraw request by ID
exports.getWithdrawById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const withdrawId = req.params.id;

    const withdraw = await Withdraw.findOne({ _id: withdrawId, userId });
    
    if (!withdraw) {
      return res.status(404).json({ 
        success: false,
        message: 'Withdraw request not found' 
      });
    }

    res.json({
      success: true,
      data: withdraw
    });
  } catch (error) {
    console.error('Error fetching withdraw by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Cancel withdraw request (only if pending)
exports.cancelWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const withdrawId = req.params.id;

    const withdraw = await Withdraw.findOne({ _id: withdrawId, userId });
    
    if (!withdraw) {
      return res.status(404).json({ 
        success: false,
        message: 'Withdraw request not found' 
      });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel withdraw request that is already processed' 
      });
    }

    withdraw.status = 'cancelled';
    await withdraw.save();

    res.json({
      success: true,
      message: 'Withdraw request cancelled successfully',
      data: withdraw
    });
  } catch (error) {
    console.error('Error cancelling withdraw request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

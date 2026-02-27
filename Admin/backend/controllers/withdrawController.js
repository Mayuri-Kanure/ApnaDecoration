const Withdraw = require('../models/Withdraw');
const User = require('../models/User');

exports.getWithdraws = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;

    let query = {};
    
    // Filter for vendor withdrawals only
    query['userId.role'] = 'vendor';
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { withdrawId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { withdrawMethod: { $regex: search, $options: 'i' } }
      ];
    }

    const withdraws = await Withdraw.find(query)
      .populate('userId', 'name email role')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Withdraw.countDocuments(query);

    // Calculate withdraw statistics
    const stats = await Withdraw.aggregate([
      { $group: {
        _id: null,
        totalWithdraws: { $sum: 1 },
        pendingWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approvedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejectedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        completedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        totalProcessingFee: { $sum: '$processingFee' }
      }}
    ]);

    const statusStats = await Withdraw.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }}
    ]);

    const methodStats = await Withdraw.aggregate([
      { $group: {
        _id: '$withdrawMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }}
    ]);

    res.json({
      data: withdraws,
      total,
      stats: {
        totalWithdraws: stats[0]?.totalWithdraws || 0,
        pendingWithdraws: stats[0]?.pendingWithdraws || 0,
        approvedWithdraws: stats[0]?.approvedWithdraws || 0,
        rejectedWithdraws: stats[0]?.rejectedWithdraws || 0,
        completedWithdraws: stats[0]?.completedWithdraws || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        totalNetAmount: stats[0]?.totalNetAmount || 0,
        totalProcessingFee: stats[0]?.totalProcessingFee || 0,
        statusDistribution: statusStats,
        methodDistribution: methodStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createWithdraw = async (req, res) => {
  try {
    const { userId, amount, withdrawMethod, methodDetails, notes } = req.body;
    const createdBy = req.user.id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const withdraw = new Withdraw({
      userId,
      userName: user.name || user.email,
      userEmail: user.email,
      amount,
      withdrawMethod,
      methodDetails,
      notes,
      netAmount: amount // Will be updated by pre-save hook if processing fee is set
    });

    await withdraw.save();

    res.status(201).json({
      message: 'Withdraw request created successfully',
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveWithdraw = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const approvedBy = req.user.id;
    
    const withdraw = await Withdraw.findById(req.params.id);
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({ message: 'Withdraw request cannot be approved' });
    }

    await withdraw.approve(approvedBy, transactionId);

    res.json({
      message: 'Withdraw request approved successfully',
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.rejectWithdraw = async (req, res) => {
  try {
    const { reason } = req.body;
    const rejectedBy = req.user.id;
    
    const withdraw = await Withdraw.findById(req.params.id);
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (withdraw.status !== 'pending') {
      return res.status(400).json({ message: 'Withdraw request cannot be rejected' });
    }

    await withdraw.reject(rejectedBy, reason);

    res.json({
      message: 'Withdraw request rejected successfully',
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWithdrawById = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    res.json({
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({})
      .populate('userId', 'name email')
      .sort({ requestedAt: -1 });

    const csvContent = [
      ['Withdraw ID', 'User Name', 'User Email', 'Amount', 'Net Amount', 'Method', 'Status', 'Requested At', 'Processed At', 'Transaction ID'],
      ...withdraws.map(withdraw => [
        withdraw.withdrawId,
        withdraw.userName,
        withdraw.userEmail,
        withdraw.amount,
        withdraw.netAmount,
        withdraw.withdrawMethod,
        withdraw.status,
        withdraw.requestedAt,
        withdraw.processedAt || '',
        withdraw.transactionId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=withdraws.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
    

const DeliveryWithdraw = require('../models/DeliveryWithdraw');

exports.getDeliveryWithdraws = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const deliveryId = req.query.deliveryId;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (deliveryId) {
      query.deliveryId = deliveryId;
    }

    if (search) {
      query.$or = [
        { withdrawId: { $regex: search, $options: 'i' } },
        { deliveryName: { $regex: search, $options: 'i' } },
        { deliveryEmail: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const withdraws = await DeliveryWithdraw.find(query)
      .populate('deliveryId', 'firstName lastName email phone')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await DeliveryWithdraw.countDocuments(query);

    // Calculate statistics
    const stats = await DeliveryWithdraw.aggregate([
      { $group: {
        _id: null,
        totalWithdraws: { $sum: 1 },
        pendingWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approvedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejectedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        completedWithdraws: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        pendingAmount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] 
          } 
        }
      }}
    ]);

    res.json({
      withdraws,
      total,
      stats: {
        totalWithdraws: stats[0]?.totalWithdraws || 0,
        pendingWithdraws: stats[0]?.pendingWithdraws || 0,
        approvedWithdraws: stats[0]?.approvedWithdraws || 0,
        rejectedWithdraws: stats[0]?.rejectedWithdraws || 0,
        completedWithdraws: stats[0]?.completedWithdraws || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        totalNetAmount: stats[0]?.totalNetAmount || 0,
        pendingAmount: stats[0]?.pendingAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createDeliveryWithdraw = async (req, res) => {
  try {
    const {
      deliveryId,
      deliveryName,
      deliveryEmail,
      amount,
      withdrawMethod,
      methodDetails,
      processingFee,
      notes
    } = req.body;

    const createdBy = req.user.id;

    // Calculate net amount
    const netAmount = amount - (processingFee || 0);

    const withdraw = new DeliveryWithdraw({
      deliveryId,
      deliveryName,
      deliveryEmail,
      amount,
      withdrawMethod,
      methodDetails,
      processingFee: processingFee || 0,
      netAmount,
      notes,
      createdBy
    });

    await withdraw.save();

    res.status(201).json({
      message: 'Delivery withdraw request created successfully',
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.approveDeliveryWithdraw = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const approvedBy = req.user.id;
    
    const withdraw = await DeliveryWithdraw.findById(req.params.id);
    
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

exports.rejectDeliveryWithdraw = async (req, res) => {
  try {
    const { reason } = req.body;
    const rejectedBy = req.user.id;
    
    const withdraw = await DeliveryWithdraw.findById(req.params.id);
    
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

exports.completeDeliveryWithdraw = async (req, res) => {
  try {
    const withdraw = await DeliveryWithdraw.findById(req.params.id);
    
    if (!withdraw) {
      return res.status(404).json({ message: 'Withdraw request not found' });
    }

    if (!withdraw.canBeProcessed()) {
      return res.status(400).json({ message: 'Withdraw request cannot be completed' });
    }

    await withdraw.complete();

    res.json({
      message: 'Withdraw request completed successfully',
      withdraw
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDeliveryWithdrawById = async (req, res) => {
  try {
    const withdraw = await DeliveryWithdraw.findById(req.params.id)
      .populate('deliveryId', 'firstName lastName email phone')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('createdBy', 'name email');
    
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

exports.getWithdrawsByDeliveryId = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    
    const withdraws = await DeliveryWithdraw.find({ deliveryId })
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ requestedAt: -1 });

    res.json({
      withdraws
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportDeliveryWithdraws = async (req, res) => {
  try {
    const withdraws = await DeliveryWithdraw.find({})
      .populate('deliveryId', 'firstName lastName email')
      .sort({ requestedAt: -1 });

    const csvContent = [
      ['Withdraw ID', 'Delivery Name', 'Delivery Email', 'Amount', 'Net Amount', 'Method', 'Status', 'Requested At', 'Processed At', 'Transaction ID'],
      ...withdraws.map(withdraw => [
        withdraw.withdrawId,
        withdraw.deliveryName,
        withdraw.deliveryEmail,
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
    res.setHeader('Content-Disposition', 'attachment; filename=delivery-withdraws.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

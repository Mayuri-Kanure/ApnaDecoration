const Refund = require('../models/Refund');
const { validationResult } = require('express-validator');

exports.getRefunds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const filter = req.query.filter;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const refunds = await Refund.find(query)
      .sort({ requestDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Refund.countDocuments(query);

    res.json({
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRefundStats = async (req, res) => {
  try {
    const stats = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const formattedStats = {
      pending: { count: 0, totalAmount: 0 },
      approved: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
      processing: { count: 0, totalAmount: 0 }
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRefund = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }
    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const refund = new Refund(req.body);
    await refund.save();

    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateRefundStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected', 'processing'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const refund = await Refund.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes: notes || '',
        processedBy: req.user?.name || 'System',
        processedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateRefund = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const refund = await Refund.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteRefund = async (req, res) => {
  try {
    const refund = await Refund.findByIdAndDelete(req.params.id);
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }
    res.json({ message: 'Refund deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.exportRefunds = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const refunds = await Refund.find(query).sort({ requestDate: -1 });

    const csvContent = [
      ['ID', 'Customer Name', 'Order ID', 'Order Date', 'Amount', 'Reason', 'Status', 'Request Date', 'Processed Date', 'Processed By'],
      ...refunds.map(refund => [
        refund._id,
        refund.customerName,
        refund.orderId,
        refund.orderDate.toISOString().split('T')[0],
        refund.amount.toFixed(2),
        refund.reason,
        refund.status,
        refund.requestDate.toISOString().split('T')[0],
        refund.processedDate ? refund.processedDate.toISOString().split('T')[0] : '',
        refund.processedBy
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=refunds-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

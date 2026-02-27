const LoyaltyPoint = require('../models/LoyaltyPoint');
const User = require('../models/User');

exports.getLoyaltyPoints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const transactionType = req.query.transactionType;
    const customerId = req.query.customerId;

    let query = {};
    
    if (transactionType && transactionType !== 'all') {
      query.transactionType = transactionType;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await LoyaltyPoint.find(query)
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await LoyaltyPoint.countDocuments(query);

    // Calculate loyalty point statistics
    const stats = await LoyaltyPoint.aggregate([
      { $group: {
        _id: null,
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        currentBalance: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }}
    ]);

    const transactionTypeStats = await LoyaltyPoint.aggregate([
      { $group: {
        _id: '$transactionType',
        count: { $sum: 1 },
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' }
      }}
    ]);

    const customerStats = await LoyaltyPoint.aggregate([
      { $group: {
        _id: '$customerId',
        customerName: { $first: '$customerName' },
        customerEmail: { $first: '$customerEmail' },
        totalPoints: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }},
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      transactions,
      stats: {
        totalCredit: stats[0]?.totalCredit || 0,
        totalDebit: stats[0]?.totalDebit || 0,
        currentBalance: stats[0]?.currentBalance || 0,
        transactionCount: stats[0]?.transactionCount || 0,
        transactionTypes: transactionTypeStats,
        topCustomers: customerStats
      },
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

exports.addLoyaltyPoints = async (req, res) => {
  try {
    const { customerId, credit, debit, transactionType, reference, orderId, expiresAt } = req.body;
    const createdBy = req.user.id;

    // Get customer details
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate new balance
    const lastTransaction = await LoyaltyPoint.findOne({ customerId }).sort({ createdAt: -1 });
    const currentBalance = lastTransaction ? lastTransaction.balance : 0;
    const newBalance = currentBalance + (credit || 0) - (debit || 0);

    const loyaltyPoint = new LoyaltyPoint({
      customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      credit: credit || 0,
      debit: debit || 0,
      balance: newBalance,
      transactionType,
      reference,
      orderId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy
    });

    await loyaltyPoint.save();

    res.status(201).json({
      message: 'Loyalty points transaction created successfully',
      transaction: loyaltyPoint
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerLoyaltyPoints = async (req, res) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await LoyaltyPoint.find({ customerId })
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await LoyaltyPoint.countDocuments({ customerId });

    const stats = await LoyaltyPoint.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      { $group: {
        _id: null,
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        currentBalance: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }}
    ]);

    res.json({
      transactions,
      stats: stats[0] || {
        totalCredit: 0,
        totalDebit: 0,
        currentBalance: 0,
        transactionCount: 0
      },
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

exports.getLoyaltyStats = async (req, res) => {
  try {
    const stats = await LoyaltyPoint.aggregate([
      { $group: {
        _id: null,
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        currentBalance: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }}
    ]);

    const recentTransactions = await LoyaltyPoint.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topCustomers = await LoyaltyPoint.aggregate([
      { $group: {
        _id: '$customerId',
        customerName: { $first: '$customerName' },
        customerEmail: { $first: '$customerEmail' },
        totalPoints: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }},
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats: stats[0] || {
        totalCredit: 0,
        totalDebit: 0,
        currentBalance: 0,
        transactionCount: 0
      },
      recentTransactions,
      topCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

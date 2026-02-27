const Wallet = require('../models/Wallet');
const User = require('../models/User');

exports.getWalletTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const transactionType = req.query.transactionType;
    const customerId = req.query.customerId;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

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

    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    const transactions = await Wallet.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Wallet.countDocuments(query);

    // Calculate wallet statistics
    const stats = await Wallet.aggregate([
      { $group: {
        _id: null,
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        currentBalance: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }}
    ]);

    const transactionTypeStats = await Wallet.aggregate([
      { $group: {
        _id: '$transactionType',
        count: { $sum: 1 },
        totalAmount: { $sum: { $add: ['$credit', '$debit'] } }
      }}
    ]);

    res.json({
      transactions,
      stats: {
        totalCredit: stats[0]?.totalCredit || 0,
        totalDebit: stats[0]?.totalDebit || 0,
        currentBalance: stats[0]?.currentBalance || 0,
        transactionCount: stats[0]?.transactionCount || 0,
        transactionTypes: transactionTypeStats
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

exports.addWalletTransaction = async (req, res) => {
  try {
    const { customerId, credit, debit, transactionType, reference } = req.body;

    // Get customer details
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate new balance
    const lastTransaction = await Wallet.findOne({ customerId }).sort({ createdAt: -1 });
    const currentBalance = lastTransaction ? lastTransaction.balance : 0;
    const newBalance = currentBalance + (credit || 0) - (debit || 0);

    // Generate transaction ID
    const count = await Wallet.countDocuments();
    const transactionId = `WAL-${String(count + 1).padStart(3, '0')}`;

    const transaction = new Wallet({
      transactionId,
      customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      credit: credit || 0,
      debit: debit || 0,
      balance: newBalance,
      transactionType,
      reference: reference || 'Transaction'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Wallet transaction created successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWalletStats = async (req, res) => {
  try {
    const stats = await Wallet.aggregate([
      { $group: {
        _id: null,
        totalCredit: { $sum: '$credit' },
        totalDebit: { $sum: '$debit' },
        currentBalance: { $sum: '$balance' },
        transactionCount: { $sum: 1 }
      }}
    ]);

    const recentTransactions = await Wallet.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: stats[0] || {
        totalCredit: 0,
        totalDebit: 0,
        currentBalance: 0,
        transactionCount: 0
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

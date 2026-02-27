const WalletBonus = require('../models/WalletBonus');
const User = require('../models/User');

exports.getWalletBonuses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bonusId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const bonuses = await WalletBonus.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await WalletBonus.countDocuments(query);

    // Calculate bonus statistics
    const stats = await WalletBonus.aggregate([
      { $group: {
        _id: null,
        totalBonuses: { $sum: 1 },
        activeBonuses: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactiveBonuses: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        expiredBonuses: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        totalUsage: { $sum: '$usageCount' }
      }}
    ]);

    const bonusTypeStats = await WalletBonus.aggregate([
      { $group: {
        _id: '$bonusType',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      bonuses,
      stats: {
        totalBonuses: stats[0]?.totalBonuses || 0,
        activeBonuses: stats[0]?.activeBonuses || 0,
        inactiveBonuses: stats[0]?.inactiveBonuses || 0,
        expiredBonuses: stats[0]?.expiredBonuses || 0,
        totalUsage: stats[0]?.totalUsage || 0,
        bonusTypes: bonusTypeStats
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getWalletBonuses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addWalletBonus = async (req, res) => {
  try {
    const { title, description, bonusType, bonusAmount, minAddAmount, maxBonus, startDate, endDate } = req.body;
    
    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(400).json({ message: 'Admin user not found' });
    }

    // Generate bonus ID
    const count = await WalletBonus.countDocuments();
    const bonusId = `BONUS-${String(count + 1).padStart(3, '0')}`;

    const walletBonus = new WalletBonus({
      bonusId,
      title,
      description,
      bonusType,
      bonusAmount: parseFloat(bonusAmount),
      minAddAmount: parseFloat(minAddAmount),
      maxBonus: parseFloat(maxBonus),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: adminUser._id
    });

    await walletBonus.save();

    res.status(201).json({
      message: 'Wallet bonus created successfully',
      bonus: walletBonus
    });
  } catch (error) {
    console.error('Error in addWalletBonus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateWalletBonus = async (req, res) => {
  try {
    const { title, description, bonusType, bonusAmount, minAddAmount, maxBonus, startDate, endDate, status } = req.body;
    
    const bonus = await WalletBonus.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        bonusType,
        bonusAmount,
        minAddAmount,
        maxBonus,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status
      },
      { new: true }
    );

    if (!bonus) {
      return res.status(404).json({ message: 'Wallet bonus not found' });
    }

    res.json({
      message: 'Wallet bonus updated successfully',
      bonus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteWalletBonus = async (req, res) => {
  try {
    const bonus = await WalletBonus.findByIdAndDelete(req.params.id);
    
    if (!bonus) {
      return res.status(404).json({ message: 'Wallet bonus not found' });
    }

    res.json({
      message: 'Wallet bonus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWalletBonusById = async (req, res) => {
  try {
    const bonus = await WalletBonus.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!bonus) {
      return res.status(404).json({ message: 'Wallet bonus not found' });
    }

    res.json({
      bonus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

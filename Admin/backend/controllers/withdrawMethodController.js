const WithdrawMethod = require('../models/WithdrawMethod');

exports.getWithdrawMethods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isActive = req.query.isActive;

    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { methodId: { $regex: search, $options: 'i' } },
        { methodName: { $regex: search, $options: 'i' } }
      ];
    }

    const methods = await WithdrawMethod.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await WithdrawMethod.countDocuments(query);

    // Calculate method statistics
    const stats = await WithdrawMethod.aggregate([
      { $group: {
        _id: null,
        totalMethods: { $sum: 1 },
        activeMethods: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactiveMethods: { $sum: { $cond: ['$isActive', 0, 1] } },
        defaultMethods: { $sum: { $cond: ['$isDefault', 1, 0] } }
      }}
    ]);

    res.json({
      methods,
      total,
      stats: {
        totalMethods: stats[0]?.totalMethods || 0,
        activeMethods: stats[0]?.activeMethods || 0,
        inactiveMethods: stats[0]?.inactiveMethods || 0,
        defaultMethods: stats[0]?.defaultMethods || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createWithdrawMethod = async (req, res) => {
  try {
    const { methodName, methodFields, isActive, isDefault } = req.body;
    const createdBy = req.user.id;

    // Check if method name already exists
    const existingMethod = await WithdrawMethod.findOne({ methodName });
    if (existingMethod) {
      return res.status(400).json({ message: 'Method name already exists' });
    }

    // If this is default, unset other default methods
    if (isDefault) {
      await WithdrawMethod.updateMany({}, { isDefault: false });
    }

    const method = new WithdrawMethod({
      methodName,
      methodFields,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
      createdBy
    });

    await method.save();

    res.status(201).json({
      message: 'Withdraw method created successfully',
      method
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateWithdrawMethod = async (req, res) => {
  try {
    const { methodName, methodFields, isActive, isDefault } = req.body;
    
    const method = await WithdrawMethod.findById(req.params.id);
    
    if (!method) {
      return res.status(404).json({ message: 'Withdraw method not found' });
    }

    // Check if method name already exists (if changing)
    if (methodName && methodName !== method.methodName) {
      const existingMethod = await WithdrawMethod.findOne({ methodName });
      if (existingMethod) {
        return res.status(400).json({ message: 'Method name already exists' });
      }
    }

    // If this is default, unset other default methods
    if (isDefault && !method.isDefault) {
      await WithdrawMethod.updateMany({}, { isDefault: false });
    }

    const updatedMethod = await WithdrawMethod.findByIdAndUpdate(
      req.params.id,
      {
        methodName,
        methodFields,
        isActive,
        isDefault
      },
      { new: true }
    );

    res.json({
      message: 'Withdraw method updated successfully',
      method: updatedMethod
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteWithdrawMethod = async (req, res) => {
  try {
    const method = await WithdrawMethod.findByIdAndDelete(req.params.id);
    
    if (!method) {
      return res.status(404).json({ message: 'Withdraw method not found' });
    }

    res.json({
      message: 'Withdraw method deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWithdrawMethodById = async (req, res) => {
  try {
    const method = await WithdrawMethod.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!method) {
      return res.status(404).json({ message: 'Withdraw method not found' });
    }

    res.json({
      method
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getActiveWithdrawMethods = async (req, res) => {
  try {
    const methods = await WithdrawMethod.find({ isActive: true })
      .sort({ isDefault: -1, methodName: 1 });

    res.json({
      methods
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

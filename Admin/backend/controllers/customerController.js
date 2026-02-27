const User = require('../models/User');
const { validationResult } = require('express-validator').validationResult;

exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'created_desc';
    const joiningDate = req.query.joiningDate;

    let query = {};
    
    if (status && status !== 'all') {
      if (status === 'blocked' || status === 'suspended') {
        query.isActive = false;
      } else if (status === 'active') {
        query.isActive = true;
      }
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (joiningDate) {
      const start = new Date(joiningDate);
      const end = new Date(joiningDate);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    let sort = { firstName: 1, lastName: 1 }; // Default to name_asc to match frontend
    switch (sortBy) {
      case 'name_asc':
        sort = { firstName: 1, lastName: 1 };
        break;
      case 'name_desc':
        sort = { firstName: -1, lastName: -1 };
        break;
      case 'most_orders':
        sort = { totalOrders: -1 };
        break;
      case 'highest_revenue':
        sort = { totalSpent: -1 };
        break;
      case 'recent_joined':
        sort = { createdAt: -1 };
        break;
      case 'oldest_joined':
        sort = { createdAt: 1 };
        break;
      default:
        break;
    }

    const customers = await User.find({ role: 'user', ...query })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments({ role: 'user', ...query });

    // Format customers for frontend
    const formattedCustomers = customers.map(customer => ({
      id: customer._id,
      name: customer.name || `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      totalOrders: 0, // Will be calculated from orders
      totalSpent: 0, // Will be calculated from orders
      status: customer.isActive ? 'active' : 'inactive',
      joiningDate: customer.createdAt,
      address: customer.address || {},
      company: customer.company || ''
    }));

    console.log('Sending customers response:', {
      customers: formattedCustomers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

    res.json({
      customers: formattedCustomers,
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
    exports.getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'user') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const Order = require('../models/Order');
    const recentOrders = await Order.find({ customer: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      customer,
      recentOrders,
      orderCount: recentOrders.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customerData = req.body;
    
    const newCustomer = await Customer.create({
      ...customerData,
      status: 'active',
      totalOrders: 0,
      totalSpent: 0
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customerData = { ...req.body };
    if (customerData.status === 'blocked' || customerData.status === 'suspended') {
      customerData.status = 'blacklisted';
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      customerData,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newThisMonth = await Customer.countDocuments({ createdAt: { $gte: oneMonthAgo } });
    
    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(3)
      .select('firstName lastName email company totalOrders totalSpent');

    const stats = {
      total: totalCustomers,
      active: activeCustomers,
      newThisMonth,
      topCustomers
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

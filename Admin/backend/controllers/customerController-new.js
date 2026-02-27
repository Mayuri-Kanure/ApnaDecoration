const User = require('../models/User');
const { validationResult } = require('express-validator').validationResult;

exports.getCustomers = async (req, res) => {
  try {
    console.log('🔥 CUSTOMER CONTROLLER EXECUTED - DEBUG LOG');
    console.log('📥 Request query params:', req.query);
    console.log('📥 Request headers:', req.headers);
    console.log('=== NEW CUSTOMER CONTROLLER ===');
    
    // Get all users with role 'user'
    const customers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${customers.length} users with role=user`);
    
    // Format for frontend
    const formattedCustomers = customers.map(customer => ({
      id: customer._id,
      name: customer.name || `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      totalOrders: 0,
      totalSpent: 0,
      status: customer.isActive ? 'active' : 'inactive',
      joiningDate: customer.createdAt,
      address: customer.address || {},
      company: customer.company || ''
    }));
    
    console.log('Formatted customers:', formattedCustomers.length);
    
    res.json({
      customers: formattedCustomers,
      pagination: {
        page: 1,
        limit: 50,
        total: customers.length,
        pages: Math.ceil(customers.length / 50)
      }
    });
    
  } catch (error) {
    console.error('Error in new customer controller:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const activeCustomers = await User.countDocuments({ role: 'user', isActive: true });
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newThisMonth = await User.countDocuments({ 
      role: 'user', 
      createdAt: { $gte: oneMonthAgo } 
    });
    
    const topCustomers = await User.find({ role: 'user' })
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

// Get customer by ID
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

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customerData = {
      ...req.body,
      role: 'user',
      isActive: true
    };
    
    const newCustomer = await User.create(customerData);

    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customerData = { ...req.body };
    
    const updatedCustomer = await User.findByIdAndUpdate(
      req.params.id,
      customerData,
      { new: true }
    );

    if (!updatedCustomer || updatedCustomer.role !== 'user') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedCustomer || deletedCustomer.role !== 'user') {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

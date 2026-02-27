const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get vendor sales data
router.get('/', auth, async (req, res) => {
  try {
    const { vendor, dateRange, page = 1, limit = 10 } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'thisWeek':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      if (startDate) {
        dateFilter.createdAt = { $gte: startDate };
      }
    }
    
    // Add vendor filter if specified
    if (vendor && vendor !== 'all') {
      dateFilter.user = vendor;
    }
    
    // Get orders with pagination
    const orders = await Order.find(dateFilter)
      .populate('user', 'name firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(dateFilter);
    
    // Format sales data
    const sales = orders.map(order => ({
      _id: order._id,
      vendorName: order.user?.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown',
      totalSales: order.pricing?.total || 0,
      orderCount: 1, // Each order represents one sale
      date: order.createdAt
    }));
    
    res.json({
      sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get vendors list for dropdown
router.get('/vendors', auth, async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }, 'name firstName lastName email');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories for inhouse sales
router.get('/categories', auth, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find({}, 'category').lean();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    const formattedCategories = categories.map(cat => ({
      _id: cat,
      name: cat
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

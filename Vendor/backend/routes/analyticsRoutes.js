const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Get vendor analytics dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    
    // Get basic stats
    const totalProducts = await Product.countDocuments({ vendorId });
    const activeProducts = await Product.countDocuments({ vendorId, status: 'approved' });
    const pendingProducts = await Product.countDocuments({ vendorId, status: 'pending' });
    
    // Get order stats
    const vendorProductIds = await Product.find({ vendorId }).distinct('_id');
    const totalOrders = await Order.countDocuments({
      'items.product': { $in: vendorProductIds }
    });
    
    const deliveredOrders = await Order.countDocuments({
      'items.product': { $in: vendorProductIds },
      status: 'delivered'
    });
    
    // Calculate revenue
    const orders = await Order.find({
      'items.product': { $in: vendorProductIds },
      status: 'delivered'
    });
    
    let totalRevenue = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (vendorProductIds.includes(item.product.toString())) {
          totalRevenue += item.price * item.quantity;
        }
      });
    });
    
    // Get recent orders
    const recentOrders = await Order.find({
      'items.product': { $in: vendorProductIds }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name email')
    .populate('items.product', 'name');
    
    // Get top products
    const topProducts = await Product.find({ vendorId })
      .sort({ orders: -1 })
      .limit(5)
      .select('name price orders revenue rating thumbnail');
    
    // Monthly sales data (last 6 months)
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = await Order.find({
        'items.product': { $in: vendorProductIds },
        status: 'delivered',
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });
      
      let monthRevenue = 0;
      monthOrders.forEach(order => {
        order.items.forEach(item => {
          if (vendorProductIds.includes(item.product.toString())) {
            monthRevenue += item.price * item.quantity;
          }
        });
      });
      
      monthlySales.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      });
    }
    
    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          pendingProducts,
          totalOrders,
          deliveredOrders,
          totalRevenue
        },
        recentOrders,
        topProducts,
        monthlySales
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

// Get sales analytics
router.get('/sales', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const vendorProductIds = await Product.find({ vendorId }).distinct('_id');
    
    // Get sales data
    const orders = await Order.find({
      'items.product': { $in: vendorProductIds },
      status: 'delivered',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate metrics
    let totalRevenue = 0;
    let totalOrders = 0;
    const dailySales = {};
    
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      
      order.items.forEach(item => {
        if (vendorProductIds.includes(item.product.toString())) {
          const itemRevenue = item.price * item.quantity;
          totalRevenue += itemRevenue;
          totalOrders += item.quantity;
          
          if (!dailySales[day]) {
            dailySales[day] = { revenue: 0, orders: 0 };
          }
          dailySales[day].revenue += itemRevenue;
          dailySales[day].orders += item.quantity;
        }
      });
    });
    
    // Format daily sales data
    const salesData = Object.keys(dailySales).map(date => ({
      date,
      revenue: dailySales[date].revenue,
      orders: dailySales[date].orders
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        salesData
      }
    });

  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales analytics',
      error: error.message
    });
  }
});

module.exports = router;

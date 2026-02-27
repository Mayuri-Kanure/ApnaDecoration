const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');

// GET vendor orders - fetch orders that contain vendor products
router.get('/', auth, async (req, res) => {
  try {
    const vendorId = req.user.id; // Assuming vendor is logged in
    
    // Fetch all orders and filter by vendor products
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    // Filter orders that contain vendor's products
    const vendorOrders = orders.filter(order => 
      order.items.some(item => 
        item.product && item.product.vendorId === vendorId
      )
    );
    
    res.json({
      success: true,
      orders: vendorOrders,
      total: vendorOrders.length
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;

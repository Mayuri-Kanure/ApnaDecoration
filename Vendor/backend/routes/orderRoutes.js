const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get vendor orders
router.get('/', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { page = 1, limit = 10, status } = req.query;

    // Find orders containing vendor's products
    const orders = await Order.find({
      'items.product': { $in: await Product.find({ vendorId }).distinct('_id') }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('customer', 'name email')
    .populate('items.product', 'name price images');

    const total = await Order.countDocuments({
      'items.product': { $in: await Product.find({ vendorId }).distinct('_id') }
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const orderId = req.params.id;
    const { status } = req.body;

    // Find order and verify vendor ownership
    const order = await Order.findOne({
      _id: orderId,
      'items.product': { $in: await Product.find({ vendorId }).distinct('_id') }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status for vendor's items only
    order.items.forEach(item => {
      const product = item.product;
      if (product.vendorId && product.vendorId.toString() === vendorId.toString()) {
        item.vendorStatus = status;
      }
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const orderId = req.params.id;

    const order = await Order.findOne({
      _id: orderId,
      'items.product': { $in: await Product.find({ vendorId }).distinct('_id') }
    })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name price images sku')
    .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: error.message
    });
  }
});

module.exports = router;

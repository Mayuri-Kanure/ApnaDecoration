const express = require('express');
const router = express.Router();
const POSOrder = require('../models/POSOrder');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `POS${year}${month}${day}${random}`;
};

// Create POS order
router.post('/orders', auth, async (req, res) => {
  try {
    const { customer, items, subtotal, productDiscount, extraDiscount, couponDiscount, tax, total, paymentMethod, paidAmount, changeAmount } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.product || item._id);
      if (product) {
        if (product.stock_qty < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${product.name}` 
          });
        }
        product.stock_qty -= item.quantity;
        await product.save();
      }
    }

    // Create order
    const order = new POSOrder({
      orderNumber: generateOrderNumber(),
      customer: customer || 'Walking Customer',
      items: items.map(item => ({
        product: item.product || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      subtotal,
      productDiscount: productDiscount || 0,
      extraDiscount: extraDiscount || 0,
      couponDiscount: couponDiscount || 0,
      tax,
      total,
      paymentMethod,
      paidAmount,
      changeAmount: changeAmount || 0,
      status: 'completed',
      createdBy: req.user.id
    });

    await order.save();

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully',
      data: order 
    });
  } catch (error) {
    console.error('POS order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all POS orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await POSOrder.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await POSOrder.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Hold order
router.post('/hold-orders', auth, async (req, res) => {
  try {
    const { customer, items, subtotal, tax, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const order = new POSOrder({
      orderNumber: generateOrderNumber(),
      customer: customer || 'Walking Customer',
      items: items.map(item => ({
        product: item.product || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      subtotal,
      tax,
      total,
      paymentMethod: 'cash',
      paidAmount: 0,
      status: 'held',
      createdBy: req.user.id
    });

    await order.save();

    res.status(201).json({ 
      success: true, 
      message: 'Order held successfully',
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get held orders
router.get('/hold-orders', auth, async (req, res) => {
  try {
    const orders = await POSOrder.find({ status: 'held' })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resume held order (convert to completed)
router.put('/hold-orders/:id/resume', auth, async (req, res) => {
  try {
    const { paymentMethod, paidAmount, changeAmount } = req.body;
    
    const order = await POSOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'held') {
      return res.status(400).json({ success: false, message: 'Order is not held' });
    }

    // Update stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.stock_qty < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${product.name}` 
          });
        }
        product.stock_qty -= item.quantity;
        await product.save();
      }
    }

    order.status = 'completed';
    order.paymentMethod = paymentMethod;
    order.paidAmount = paidAmount;
    order.changeAmount = changeAmount || 0;
    await order.save();

    res.json({ 
      success: true, 
      message: 'Order completed successfully',
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete held order
router.delete('/hold-orders/:id', auth, async (req, res) => {
  try {
    const order = await POSOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'held') {
      return res.status(400).json({ success: false, message: 'Can only delete held orders' });
    }

    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

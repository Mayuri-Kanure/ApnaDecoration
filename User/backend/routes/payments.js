const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    const orderData = {
      orderId: orderId,
      userId: req.user.id,
      amount: amount
    };

    const result = await paymentService.createRazorpayOrder(orderData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// Verify Payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment verification fields are required'
      });
    }

    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    };

    const result = await paymentService.verifyPayment(paymentData);

    res.json({
      success: true,
      data: result,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

// Process Refund
router.post('/refund', auth, async (req, res) => {
  try {
    const { orderId, refundAmount, reason } = req.body;

    if (!orderId || !refundAmount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and refund amount are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    const result = await paymentService.processRefund(orderId, refundAmount, reason);

    res.json({
      success: true,
      data: result,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('❌ Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Refund processing failed'
    });
  }
});

// Get Payment Details
router.get('/payment/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const result = await paymentService.getPaymentDetails(paymentId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment details'
    });
  }
});

// Get Order Payment History
router.get('/order/:orderId/history', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    const result = await paymentService.getOrderPaymentHistory(orderId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history'
    });
  }
});

// Test Razorpay Connection
router.get('/test', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    // Test by fetching payment methods
    const result = await razorpay.payments.all({
      count: 1
    });
    
    res.json({
      success: true,
      message: 'Razorpay connection successful',
      credentials: {
        key_id: process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET',
        key_secret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    console.error('Razorpay test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay connection failed',
      error: error.message
    });
  }
});

// Get Razorpay Key (for frontend)
router.get('/key', (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890abcdef'
  });
});

module.exports = router;

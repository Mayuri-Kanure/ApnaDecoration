const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
// const emailService = require('./emailService'); // Disabled to prevent startup errors

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890abcdef', // Test key
  key_secret: process.env.RAZORPAY_KEY_SECRET || '1234567890abcdef1234567890abcdef' // Test secret
});

class PaymentService {
  // Create Razorpay Order
  async createRazorpayOrder(orderData) {
    try {
      console.log('🔧 Creating Razorpay order:', orderData);

      const options = {
        amount: orderData.amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${orderData.orderId}`,
        notes: {
          orderId: orderData.orderId,
          userId: orderData.userId,
          type: 'product_purchase'
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);
      console.log('✅ Razorpay order created:', razorpayOrder);

      return {
        success: true,
        order: razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890abcdef'
      };
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Verify Razorpay Payment
  async verifyPayment(paymentData) {
    try {
      console.log('🔍 Verifying Razorpay payment:', paymentData);

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId
      } = paymentData;

      // Generate signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '1234567890abcdef1234567890abcdef')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Verify signature
      const isSignatureValid = generatedSignature === razorpay_signature;
      
      if (!isSignatureValid) {
        throw new Error('Invalid payment signature');
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      if (payment.status !== 'captured') {
        throw new Error('Payment not captured');
      }

      // Update order in database
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order with payment details
      order.paymentStatus = 'paid';
      order.paymentMethod = 'razorpay';
      order.paymentDetails = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: payment.amount / 100, // Convert back to rupees
        currency: payment.currency,
        status: payment.status,
        captured_at: new Date()
      };
      order.orderStatus = 'confirmed';
      
      await order.save();

      console.log('✅ Payment verified and order updated:', order);

      // Send payment confirmation email (async, don't wait)
      if (order.customerEmail || order.userId?.email) {
        const customerEmail = order.customerEmail || order.userId?.email;
        // emailService.sendPaymentConfirmation(order, { // Temporarily disabled
        //   razorpay_order_id,
        //   razorpay_payment_id,
        //   razorpay_signature,
        //   amount: payment.amount / 100, // Convert back to rupees
        //   currency: payment.currency,
        //   status: payment.status,
        //   captured_at: new Date()
        // }).catch(emailError => {
        //   console.error('❌ Failed to send payment confirmation email:', emailError);
        // });
        console.log('📧 Payment confirmation email temporarily disabled');
      }

      return {
        success: true,
        order: order,
        payment: payment
      };
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw new Error(error.message || 'Payment verification failed');
    }
  }

  // Process refund
  async processRefund(orderId, refundAmount, reason) {
    try {
      console.log('🔄 Processing refund for order:', orderId);

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentMethod !== 'razorpay') {
        throw new Error('Only Razorpay payments can be refunded');
      }

      const refund = await razorpay.refunds.create({
        payment_id: order.paymentDetails.razorpay_payment_id,
        amount: refundAmount * 100, // Convert to paise
        notes: {
          orderId: orderId,
          reason: reason || 'Customer requested refund'
        }
      });

      // Update order with refund details
      order.refundDetails = {
        refund_id: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: reason,
        created_at: refund.created_at
      };

      await order.save();

      console.log('✅ Refund processed:', refund);

      return {
        success: true,
        refund: refund,
        order: order
      };
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      throw new Error(error.message || 'Refund processing failed');
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment: payment
      };
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // Get order payment history
  async getOrderPaymentHistory(orderId) {
    try {
      const order = await Order.findById(orderId)
        .select('paymentDetails refundDetails paymentStatus paymentMethod')
        .populate('userId', 'name email');

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('❌ Error fetching payment history:', error);
      throw new Error('Failed to fetch payment history');
    }
  }
}

module.exports = new PaymentService();

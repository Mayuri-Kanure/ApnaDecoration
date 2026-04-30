const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");
const NotificationHelper = require("./notificationHelper");
// const emailService = require('./emailService'); // Disabled to prevent startup errors

// Initialize Razorpay instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

// Validate environment variables
if (!razorpayKeyId || !razorpayKeySecret) {
  console.error("❌ Razorpay environment variables missing:");
  console.error("RAZORPAY_KEY_ID:", razorpayKeyId ? "✅ Set" : "❌ Missing");
  console.error(
    "RAZORPAY_KEY_SECRET:",
    razorpayKeySecret ? "✅ Set" : "❌ Missing",
  );
  throw new Error("Razorpay environment variables are not configured properly");
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Log Razorpay initialization
console.log("🔧 Razorpay Initialized:");
console.log("Key ID:", razorpayKeyId ? "✅ Set" : "❌ Missing");
console.log("Key Secret:", razorpayKeySecret ? "✅ Set" : "❌ Missing");
console.log("Environment:", process.env.NODE_ENV);
console.log("All env vars:", {
  RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});

class PaymentService {
  // Create Razorpay Order
  async createRazorpayOrder(orderData) {
    try {
      console.log(
        "🔍 DEBUG: createRazorpayOrder called with:",
        JSON.stringify(orderData, null, 2),
      );
      console.log("🔍 DEBUG: orderData type:", typeof orderData);
      console.log("🔍 DEBUG: orderData.orderId:", orderData?.orderId);
      console.log(
        "🔍 DEBUG: orderData.orderId type:",
        typeof orderData?.orderId,
      );

      // Validate input parameters
      if (!orderData || !orderData.orderId) {
        console.log(
          "🔍 DEBUG: FAILED VALIDATION - orderData or orderId missing",
        );
        throw new Error("Order ID is required");
      }

      console.log(
        "🔍 DEBUG: About to fetch order from DB with ID:",
        orderData.orderId,
      );

      // Get order from database to ensure amount is correct
      const order = await Order.findById(orderData.orderId);

      console.log(
        "🔍 DEBUG: DB fetch result:",
        order ? "ORDER FOUND" : "ORDER NOT FOUND",
      );
      console.log(
        "🔍 DEBUG: FINAL ORDER FROM DB:",
        JSON.stringify(order, null, 2),
      );

      if (!order) {
        console.log("🔍 DEBUG: ORDER NOT FOUND - throwing error");
        throw new Error(`Order not found with ID: ${orderData.orderId}`);
      }

      console.log(
        "🔍 DEBUG: ORDER PRICING:",
        JSON.stringify(order.pricing, null, 2),
      );
      console.log("🔍 DEBUG: ORDER TOTAL:", order.pricing?.total);
      console.log("🔍 DEBUG: ORDER TOTAL TYPE:", typeof order.pricing?.total);

      console.log(" Found order:", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        pricing: order.pricing,
        total: order.pricing?.total,
        paymentStatus: order.paymentStatus,
        userId: order.user,
      });

      // Check if order is already paid
      if (order.paymentStatus === "paid") {
        throw new Error("Order already paid");
      }

      // Validate pricing data
      if (
        !order.pricing ||
        order.pricing.total === undefined ||
        order.pricing.total === null
      ) {
        console.error(" Invalid pricing data:", order.pricing);
        throw new Error("Order pricing data is missing or invalid");
      }

      if (order.pricing.total <= 0) {
        throw new Error(
          `Invalid order amount: ${order.pricing.total}. Amount must be greater than 0.`,
        );
      }

      // Validate and prepare amount
      if (!order.pricing || !order.pricing.total) {
        throw new Error("Order total is not defined");
      }

      const amountInPaise = Math.round(order.pricing.total * 100);
      if (amountInPaise <= 0 || !Number.isInteger(amountInPaise)) {
        throw new Error(
          `Invalid amount: ${amountInPaise}. Must be a positive integer`,
        );
      }

      const options = {
        amount: amountInPaise, //  Use database amount, not frontend
        currency: "INR",
        receipt: `order_${orderData.orderId}`,
        notes: {
          orderId: orderData.orderId.toString(),
          userId: order.user.toString(), // ✅ FIX: Convert ObjectId to string
          type: "product_purchase",
        },
      };

      console.log(" Razorpay options:", {
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes,
      });

      // Validate Razorpay instance before making API call
      if (!razorpay || !razorpay.orders) {
        throw new Error("Razorpay instance not properly initialized");
      }

      const razorpayOrder = await razorpay.orders.create(options);
      console.log(" Razorpay order created:", razorpayOrder);

      return {
        success: true,
        order: razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SQEslRVc6Ivjz6",
      };
    } catch (error) {
      console.error(" Error creating Razorpay order:", error);
      console.error(" Error details:", {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        description: error.description,
        metadata: error.metadata,
        stack: error.stack,
      });

      // Handler specific Razorpay errors
      if (error.statusCode === 401) {
        throw new Error("Invalid Razorpay credentials");
      } else if (error.statusCode === 400) {
        const errorMsg = error.description?.trim() || error.message?.trim() || "Razorpay validation failed";
        const finalMsg = errorMsg === "undefined" ? "Razorpay validation failed" : errorMsg;
        throw new Error(`Invalid order data: ${finalMsg}`);
      } else if (error.statusCode === 429) {
        throw new Error("Too many requests. Please try again later");
      }

      throw new Error(error.message || "Failed to create payment order");
    }
  }

  // Verify Razorpay Payment
  async verifyPayment(paymentData) {
    try {
      console.log("🔍 Verifying Razorpay payment:", paymentData);

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      } = paymentData;

      // Generate signature
      const generatedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET || "463d5eQ59Dt3lrD3gn13xfEZ",
        )
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      // Verify signature
      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        throw new Error("Invalid payment signature");
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status !== "captured") {
        throw new Error("Payment not captured");
      }

      // Update order in database
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Update order with payment details
      order.paymentStatus = "paid";
      order.paymentMethod = "razorpay";
      order.paymentDetails = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: payment.amount / 100, // Convert back to rupees
        currency: payment.currency,
        status: payment.status,
        captured_at: new Date(),
      };
      order.orderStatus = "confirmed";

      await order.save();

      console.log("✅ Payment verified and order updated:", order);

      // 🔔 Create notification for payment received
      try {
        await NotificationHelper.notifyPaymentReceived(order.user, order);
        console.log("✅ Payment notification created");
      } catch (notifError) {
        console.error("❌ Error creating payment notification:", notifError);
        // Don't fail the payment if notification fails
      }

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
        console.log("📧 Payment confirmation email temporarily disabled");
      }

      return {
        success: true,
        order: order,
        payment: payment,
      };
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      throw new Error(error.message || "Payment verification failed");
    }
  }

  // Process refund
  async processRefund(orderId, refundAmount, reason) {
    try {
      console.log("🔄 Processing refund for order:", orderId);

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.paymentMethod !== "razorpay") {
        throw new Error("Only Razorpay payments can be refunded");
      }

      const refund = await razorpay.refunds.create({
        payment_id: order.paymentDetails.razorpay_payment_id,
        amount: refundAmount * 100, // Convert to paise
        notes: {
          orderId: orderId,
          reason: reason || "Customer requested refund",
        },
      });

      // Update order with refund details
      order.refundDetails = {
        refund_id: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason: reason,
        created_at: refund.created_at,
      };

      await order.save();

      console.log("✅ Refund processed:", refund);

      return {
        success: true,
        refund: refund,
        order: order,
      };
    } catch (error) {
      console.error("❌ Error processing refund:", error);
      throw new Error(error.message || "Refund processing failed");
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment: payment,
      };
    } catch (error) {
      console.error("❌ Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  // Get order payment history
  async getOrderPaymentHistory(orderId) {
    try {
      const order = await Order.findById(orderId)
        .select("paymentDetails refundDetails paymentStatus paymentMethod")
        .populate("userId", "name email");

      if (!order) {
        throw new Error("Order not found");
      }

      return {
        success: true,
        order: order,
      };
    } catch (error) {
      console.error("❌ Error fetching payment history:", error);
      throw new Error("Failed to fetch payment history");
    }
  }
}

module.exports = new PaymentService();

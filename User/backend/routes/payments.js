const express = require("express");
const router = express.Router();
const paymentService = require("../services/paymentService");
const { auth } = require("../middleware/auth");
const Order = require("../models/Order");

// Create Razorpay Order
router.post("/create-order", auth, async (req, res) => {
  try {
    console.log("🚀 PAYMENT ENDPOINT HIT!");
    console.log("🔍 DEBUG: Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 DEBUG: Request body type:", typeof req.body);
    console.log("🔍 DEBUG: Authenticated user:", req.user);
    console.log("🔍 DEBUG: req.user.id:", req.user?.id);
    console.log("🔍 DEBUG: req.user.userId:", req.user?.userId);

    const { orderId, amount } = req.body;

    console.log("🔍 DEBUG: Extracted orderId:", orderId);
    console.log("🔍 DEBUG: Extracted amount:", amount);
    console.log("🔍 DEBUG: orderId type:", typeof orderId);
    console.log("🔍 DEBUG: amount type:", typeof amount);

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and amount are required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Debug logging for authentication
    console.log("🔍 Payment Auth Debug:", {
      orderUser: order.user,
      orderUserStr: order.user ? order.user.toString() : null,
      orderUserType: typeof order.user,
      reqUserId: req.user.id || req.user.userId, // ✅ Fix: Check both fields
      reqUserIdStr:
        req.user.id || req.user.userId
          ? (req.user.id || req.user.userId).toString()
          : null,
      reqUserIdType: typeof (req.user.id || req.user.userId),
      reqUser: req.user,
      orderId: orderId,
    });

    // Safe check for user to prevent undefined.toString() crash
    const orderUserStr = order.user ? order.user.toString() : null;
    const reqUserIdStr = req.user.id || req.user.userId; // ✅ Fix: Check both fields
    const reqUserIdFinal = reqUserIdStr ? reqUserIdStr.toString() : null;

    if (!orderUserStr || orderUserStr !== reqUserIdFinal) {
      console.log("❌ Payment authorization failed:", {
        orderUserStr,
        reqUserIdFinal,
        reqUserIdStr,
        orderExists: !!order,
        userExists: !!req.user,
      });
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order",
      });
    }

    console.log("✅ Payment authorization successful!");
    const orderData = {
      orderId: orderId,
      userId: req.user.id,
      amount: amount,
    };

    console.log("🔍 DEBUG: About to call paymentService.createRazorpayOrder");
    console.log(
      "🔍 DEBUG: orderData being passed:",
      JSON.stringify(orderData, null, 2),
    );

    const result = await paymentService.createRazorpayOrder(orderData);

    console.log(
      "🔍 DEBUG: paymentService returned successfully:",
      result.order?.id,
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Payment order creation error:", error);
    console.error("❌ Full error details:", {
      message: error.message,
      statusCode: error.statusCode,
      description: error.description,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create payment order",
      ...(error.description && { error: { description: error.description } }),
    });
  }
});

// Verify Payment
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "All payment verification fields are required",
      });
    }

    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    };

    const result = await paymentService.verifyPayment(paymentData);

    res.json({
      success: true,
      data: result,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
});

// Process Refund
router.post("/refund", auth, async (req, res) => {
  try {
    const { orderId, refundAmount, reason } = req.body;

    if (!orderId || !refundAmount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and refund amount are required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Safe check for user to prevent undefined.toString() crash
    if (!order.user || order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order",
      });
    }

    const result = await paymentService.processRefund(
      orderId,
      refundAmount,
      reason,
    );

    res.json({
      success: true,
      data: result,
      message: "Refund processed successfully",
    });
  } catch (error) {
    console.error("❌ Refund processing error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Refund processing failed",
    });
  }
});

// Get Payment Details
router.get("/payment/:paymentId", auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const result = await paymentService.getPaymentDetails(paymentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Get payment details error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment details",
    });
  }
});

// Get Order Payment History
router.get("/order/:orderId/history", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Safe check for user to prevent undefined.toString() crash
    if (!order.user || order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order",
      });
    }

    const result = await paymentService.getOrderPaymentHistory(orderId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment history",
    });
  }
});

// Test Razorpay Connection
router.get("/test", async (req, res) => {
  try {
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Test by fetching payment methods
    const result = await razorpay.payments.all({
      count: 1,
    });

    res.json({
      success: true,
      message: "Razorpay connection successful",
      credentials: {
        key_id: process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET",
        key_secret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET",
      },
    });
  } catch (error) {
    console.error("Razorpay test failed:", error);
    res.status(500).json({
      success: false,
      message: "Razorpay connection failed",
      error: error.message,
    });
  }
});

// Get Razorpay Key (for frontend)
router.get("/key", (req, res) => {
  res.json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_live_RsakLTdHRff3gk", // ✅ LIVE key
  });
});

module.exports = router;

const express = require("express");
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/auth");
const upload = require("../middlewares/upload"); // Import upload directly

const router = express.Router();

// Apply auth middleware to all subsequent routes
router.use(authMiddleware);

// User endpoints (require authentication)
router.get("/", orderController.getOrders);

// Get single order
router.get("/:id", orderController.getOrderById);

// Create new order (temporarily disabled upload middleware for testing)
router.post("/", orderController.createOrder);

// Create service booking (with inline multer)
router.post(
  "/booking",
  upload.single("referenceImage"),
  orderController.createServiceBooking,
);

// Test endpoint to verify backend is working
router.get("/test", (req, res) => {
  console.log("🔍 TEST ENDPOINT HIT");
  res.json({
    success: true,
    message: "Backend is working",
    timestamp: new Date().toISOString(),
  });
});

// Cancel order - with direct null checks as backup
router.put("/:id/cancel", async (req, res) => {
  console.log("� API VERSION: v2.1 - Cancel Fix Applied");
  console.log("� ROUTE HIT - Cancel order endpoint reached");

  try {
    console.log("🔍 DIRECT CANCEL ORDER ENDPOINT HIT");

    const { id } = req.params;
    const { reason } = req.body;

    console.log("🔍 DIRECT CANCEL ORDER REQUEST:", { id, reason });

    // Get user ID with multiple fallbacks
    const userId =
      req.user?.userId || req.user?._id?.toString() || req.user?.id;
    console.log("🔍 User ID from request:", userId);
    console.log("🔍 Full user object:", req.user);

    // Validate inputs
    if (!id) {
      console.log("❌ Missing order ID");
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!userId) {
      console.log("❌ Missing user ID");
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Direct order lookup with null checks
    const { Order } = require("../models");
    const mongoose = require("mongoose");
    console.log("🔍 Looking up order with ID:", id);
    console.log("🔍 ID type:", typeof id);
    console.log("🔍 Is valid ObjectId?", mongoose.Types.ObjectId.isValid(id));
    console.log("🔍 Order model:", Order);
    console.log("🔍 Order model findOne:", typeof Order.findOne);

    // Try to convert to ObjectId if it's a valid string
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
      console.log("🔍 Converted ObjectId:", objectId);
    } catch (error) {
      console.log("❌ Invalid ObjectId format:", error.message);
    }

    const order = await Order.findById(objectId || id);
    console.log("🔍 Order lookup result:", order);

    if (!order) {
      console.log("❌ Order not found:", id);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("🔍 Order found:", {
      orderId: order._id,
      orderUser: order.user,
      orderUserType: typeof order.user,
      orderStatus: order.status,
    });

    // Check user ownership with null safety
    if (!order.user) {
      console.log("❌ Order has no user associated");
      return res.status(400).json({
        success: false,
        message: "Order is not associated with any user",
      });
    }

    // Handle different user reference formats
    let orderUserId;
    try {
      console.log("DEBUG order.user:", order.user);
      console.log("DEBUG typeof:", typeof order.user);

      if (order.user && typeof order.user === "object" && order.user._id) {
        orderUserId = order.user._id.toString();
      } else if (typeof order.user === "string") {
        orderUserId = order.user;
      } else if (order.user) {
        orderUserId = order.user.toString();
      } else {
        console.log("❌ order.user is null");
        return res.status(400).json({
          success: false,
          message: "Order user is missing",
        });
      }
    } catch (error) {
      console.log("❌ Error converting order user ID:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing order user ID",
      });
    }

    console.log("🔍 User ownership check:", { orderUserId, userId });

    if (orderUserId !== userId) {
      console.log("❌ User ownership check failed:", { orderUserId, userId });
      return res.status(403).json({
        success: false,
        message: "Unauthorized - you do not own this order",
      });
    }

    // Check order status
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Update order status
    order.status = "cancelled";
    order.timeline = order.timeline || [];

    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      note: reason || "Customer requested cancellation",
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    console.log(" Saving order...");
    await order.save();
    console.log(" Order cancelled successfully:", order._id);

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Direct cancel error:", error);
    console.error("❌ Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
});

// Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// Track order (public)
router.get("/track/:orderNumber", orderController.trackOrder);

// Clear cancelled orders
router.delete("/clear-cancelled", orderController.clearCancelledOrders);

module.exports = router;

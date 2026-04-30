const express = require("express");
const orderController = require("../controllers/orderController");

console.log("🔥 ADMIN ORDERS ROUTE LOADED");

const router = express.Router();

// Admin endpoints (no auth for testing)
router.get("/", orderController.getAdminOrders); // Admin get all orders

// Support for dashboard/orders/canceled URL pattern
router.get("/orders/canceled", (req, res) => {
  console.log("DASHBOARD CANCELLED ORDERS REQUEST RECEIVED");
  console.log("Original query:", req.query);

  // Set status filter for cancelled orders
  req.query.status = "cancelled";
  console.log("Modified query:", req.query);

  console.log("Calling getAdminOrders with cancelled filter...");
  return orderController.getAdminOrders(req, res);
});

// Support for dashboard/orders URL pattern (all orders)
router.get("/orders", orderController.getAdminOrders);

// Dashboard statistics with cancelled orders count
router.get("/stats", async (req, res) => {
  try {
    console.log("Admin dashboard stats request");
    const Order = require("../models/Order");

    const [
      totalOrders,
      cancelledOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
    ]);

    const activeOrders = totalOrders - cancelledOrders;

    console.log("Dashboard stats calculated:", {
      totalOrders,
      cancelledOrders,
      activeOrders,
      pendingOrders,
      confirmedOrders,
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        cancelledOrders,
        activeOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Test endpoint to verify admin routes work
router.get("/test", (req, res) => {
  console.log("🔍 ADMIN TEST ENDPOINT HIT");
  res.json({
    success: true,
    message: "Admin routes are working",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

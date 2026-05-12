const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");

// Get vendor's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Fetching vendor orders for user:", req.user.id);

    // Get vendor's products first
    const VendorProduct = require("../models/VendorProduct");
    const vendorProducts = await VendorProduct.find({
      vendor: req.user.id,
    }).select("_id");
    const vendorProductIds = vendorProducts.map((p) => p._id);

    console.log("📦 Vendor product IDs:", vendorProductIds);

    // Get orders that contain vendor's products
    const orders = await Order.find({
      "items.product": { $in: vendorProductIds },
      "items.productModel": "VendorProduct",
    })
      .populate({
        path: "items.product",
        model: "VendorProduct",
        select: "name vendor images",
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log("📊 Found orders:", orders.length);

    res.json({
      success: true,
      orders: orders,
      total: orders.length,
      vendorId: req.user.id,
      vendorProductCount: vendorProductIds.length,
      message:
        orders.length === 0
          ? "No orders found with your products"
          : `Found ${orders.length} orders`,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch vendor orders",
    });
  }
});

module.exports = router;

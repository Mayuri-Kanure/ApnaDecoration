const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Order = require("../models/Order");

// GET vendor orders - fetch orders that contain vendor products (filtered by specific vendor)
router.get("/", auth, async (req, res) => {
  try {
    const vendorId = req.user.id; // Vendor ID from JWT token
    console.log("🔍 Fetching orders for vendor:", vendorId);

    // Get vendor info for verification
    const VendorProduct = require("../models/VendorProduct");
    const vendor = await VendorProduct.findOne({ vendorId: vendorId });
    if (!vendor) {
      console.log("❌ No products found for this vendor");
      return res.json({
        success: true,
        orders: [],
        total: 0,
        message: "No products found for this vendor",
      });
    }

    // Fetch all orders and populate products with correct model
    const orders = await Order.find()
      .populate("items.product") // Populate all product references first
      .sort({ createdAt: -1 });

    console.log("📦 Total orders found:", orders.length);

    // Filter and process orders for THIS SPECIFIC vendor
    const vendorOrders = orders
      .map((order) => {
        console.log("🔍 Processing order:", order.orderNumber);
        console.log("🔍 Order items:", order.items);

        // Filter items to show only THIS VENDOR's products
        const vendorItems = order.items.filter((item) => {
          console.log("🔍 Checking item:", {
            productModel: item.productModel,
            productId: item.product,
            productName: item.product?.name,
            vendorId: item.product?.vendorId,
          });

          // Must be a vendor product AND belong to THIS SPECIFIC vendor
          if (item.productModel !== "VendorProduct") {
            console.log("🚫 Skipping non-vendor product:", item.productModel);
            return false; // Skip admin products
          }

          // Handle case where product is populated but vendorId might be null (regular products)
          if (!item.product) {
            console.log("⚠️ Product not populated for item:", item._id);
            return false;
          }

          // Check if product belongs to this vendor (handle both populated and unpopulated cases)
          const belongsToThisVendor =
            item.product &&
            item.product.vendorId &&
            item.product.vendorId.toString() === vendorId.toString();

          console.log("🔍 Vendor check:", {
            itemVendorId: item.product?.vendorId?.toString(),
            thisVendorId: vendorId.toString(),
            belongs: belongsToThisVendor,
          });

          if (!belongsToThisVendor) {
            console.log(
              "🚫 Product belongs to different vendor:",
              item.product.vendorId ? item.product.vendorId.toString() : "null",
              (item.product && item.product.name) || "Unknown",
            );
            console.log("   This vendor:", vendorId.toString());
            return false;
          }

          console.log(
            "✅ Product belongs to this vendor:",
            (item.product && item.product.name) || "Unknown",
          );
          return true;
        });

        // If this order has THIS VENDOR's products, return filtered order
        if (vendorItems.length > 0) {
          // Calculate vendor's portion of order
          const vendorTotal = vendorItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0,
          );
          console.log("✅ Vendor order found:", order.orderNumber);
          console.log("   Original items:", order.items.length);
          console.log("   Vendor items:", vendorItems.length);
          console.log("   Vendor total:", vendorTotal);
          return {
            ...order.toObject(),
            items: vendorItems,
            vendorTotal, // Add vendor's total
            originalTotal: order.totalAmount, // Keep original total for reference
            isMixedOrder: vendorItems.length < order.items.length, // Flag if order has mixed products
            vendorInfo: {
              vendorId,
              productCount: vendorItems.length,
            },
          };
        }
        return null; // Skip orders without vendor products
      })
      .filter((order) => order !== null); // Remove null orders

    console.log("🎯 Filtered vendor orders count:", vendorOrders.length);

    res.json({
      success: true,
      orders: vendorOrders,
      total: vendorOrders.length,
      vendorId: vendorId,
      message:
        vendorOrders.length > 0
          ? `Found ${vendorOrders.length} orders with your products`
          : "No orders found with your products",
    });
  } catch (error) {
    console.error("❌ Error fetching vendor orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;

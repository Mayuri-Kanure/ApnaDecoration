const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const VendorProduct = require("../models/VendorProduct");
const { auth } = require("../middleware/auth");

// Get vendor dashboard analytics
router.get("/dashboard", auth, async (req, res) => {
  try {
    console.log("=== VENDOR DASHBOARD ANALYTICS API CALLED ===");
    const vendorId = req.user?.id || req.user?.userId; // Assuming vendor ID comes from auth middleware

    // Get vendor's products
    const vendorProducts = await VendorProduct.find({ vendorId });
    const productIds = vendorProducts.map((p) => p._id);

    // Calculate basic stats
    const totalProducts = vendorProducts.length;
    const approvedProducts = vendorProducts.filter(
      (p) => p.status === "approved",
    ).length;
    const pendingProducts = vendorProducts.filter(
      (p) => p.status === "pending",
    ).length;
    const rejectedProducts = vendorProducts.filter(
      (p) => p.status === "rejected",
    ).length;

    // Get orders containing vendor's products
    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered",
    ).length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const processingOrders = orders.filter(
      (o) => o.status === "processing",
    ).length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;

    // Calculate revenue
    let totalRevenue = 0;
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productIds.includes(item.product.toString())) {
          totalRevenue += (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    // Monthly sales data (last 6 months)
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
      });

      let monthRevenue = 0;
      let monthOrderCount = 0;
      monthOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (productIds.includes(item.product.toString())) {
            monthRevenue += (item.price || 0) * (item.quantity || 1);
            monthOrderCount += 1;
          }
        });
      });

      monthlySales.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: monthRevenue,
        orders: monthOrderCount,
      });
    }

    // Top selling products
    const productSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product.toString();
        if (productIds.includes(productId)) {
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.productName || "Product",
              sales: 0,
              revenue: 0,
            };
          }
          productSales[productId].sales += item.quantity || 1;
          productSales[productId].revenue +=
            (item.price || 0) * (item.quantity || 1);
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock alerts
    const lowStockProducts = vendorProducts.filter((p) => (p.stock || 0) < 5);

    const analyticsData = {
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        rejectedProducts,
        totalOrders,
        deliveredOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        totalRevenue,
        lowStockAlerts: lowStockProducts.length,
      },
      monthlySales,
      topProducts,
      recentOrders: orders.slice(0, 5),
      lowStockProducts: lowStockProducts.slice(0, 5),
    };

    console.log("✅ Vendor analytics data calculated successfully");
    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Error in vendor dashboard analytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get vendor earnings and payment data
router.get("/earnings", auth, async (req, res) => {
  try {
    console.log("=== VENDOR EARNINGS ANALYTICS API CALLED ===");
    const vendorId = req.user?.id || req.user?.userId;
    const { period = "30d" } = req.query;

    // Get vendor's products
    const vendorProducts = await VendorProduct.find({ vendorId });
    const productIds = vendorProducts.map((p) => p._id);

    // Calculate date range
    let startDate;
    const endDate = new Date();

    switch (period) {
      case "7d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1y":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get orders in date range
    const orders = await Order.find({
      "items.product": { $in: productIds },
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate earnings
    let totalEarnings = 0;
    let totalOrders = 0;
    const dailyEarnings = {};

    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split("T")[0];

      order.items.forEach((item) => {
        if (productIds.includes(item.product.toString())) {
          const itemEarnings = (item.price || 0) * (item.quantity || 1);
          totalEarnings += itemEarnings;
          totalOrders += item.quantity || 1;

          if (!dailyEarnings[day]) {
            dailyEarnings[day] = { earnings: 0, orders: 0 };
          }
          dailyEarnings[day].earnings += itemEarnings;
          dailyEarnings[day].orders += item.quantity || 1;
        }
      });
    });

    // Format daily earnings data
    const earningsData = Object.keys(dailyEarnings)
      .map((date) => ({
        date,
        earnings: dailyEarnings[date].earnings,
        orders: dailyEarnings[date].orders,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Commission calculation (assuming 10% commission)
    const commissionRate = 0.1;
    const totalCommission = totalEarnings * commissionRate;
    const netEarnings = totalEarnings - totalCommission;

    res.json({
      success: true,
      data: {
        period,
        totalEarnings,
        totalCommission,
        netEarnings,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalEarnings / totalOrders : 0,
        earningsData,
      },
    });
  } catch (error) {
    console.error("❌ Error in vendor earnings analytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;

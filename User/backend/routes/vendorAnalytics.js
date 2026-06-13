const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const vendorAnalyticsController = require("../controllers/vendorAnalyticsController");
const router = express.Router();

// Get vendor dashboard analytics
router.get("/dashboard", authMiddleware, vendorAnalyticsController.getDashboardAnalytics);

// Get vendor revenue analytics
router.get("/revenue", authMiddleware, vendorAnalyticsController.getRevenueAnalytics);

// Get product sales analytics
router.get("/products", authMiddleware, vendorAnalyticsController.getProductSalesAnalytics);

// Get earnings summary
router.get("/earnings", authMiddleware, vendorAnalyticsController.getEarningsSummary);

module.exports = router;

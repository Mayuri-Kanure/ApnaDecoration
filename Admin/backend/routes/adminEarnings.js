const express = require('express');
const router = express.Router();
const adminEarningsController = require('../controllers/adminEarningsController');
const { auth, authorize } = require('../middleware/auth');

// Admin Earnings Summary
router.get('/summary', auth, adminEarningsController.getAdminEarningsSummary);

// Admin Earnings Chart Data (Monthly Trends)
router.get('/chart', auth, adminEarningsController.getAdminEarningsChart);

// Admin Payment Status Breakdown
router.get('/payment-status', auth, adminEarningsController.getAdminPaymentStatus);

// Admin Total Sales Table Data
router.get('/total-sales', auth, adminEarningsController.getAdminTotalSales);

module.exports = router;

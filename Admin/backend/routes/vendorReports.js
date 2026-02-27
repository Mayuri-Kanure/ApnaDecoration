const express = require('express');
const router = express.Router();
const vendorReportsController = require('../controllers/vendorReportsController');
const { auth } = require('../middleware/auth');

// Vendor Summary
router.get(['/vendor-summary', '/summary'], auth, vendorReportsController.getVendorSummary);

// Vendor Earnings Chart Data
router.get(['/vendor-earnings', '/earnings'], auth, vendorReportsController.getVendorEarnings);

// Vendor Details Table Data
router.get(['/vendor-details', '/details'], auth, vendorReportsController.getVendorDetails);

module.exports = router;

const express = require('express');
const router = express.Router();
const transactionReportController = require('../controllers/transactionReportController');
const { auth, authorize } = require('../middleware/auth');

// Order Transactions
router.get('/orders', auth, transactionReportController.getOrderTransactions);

// Expense Transactions  
router.get('/expenses', auth, transactionReportController.getExpenseTransactions);

// Refund Transactions
router.get('/refunds', auth, transactionReportController.getRefundTransactions);

// Download PDF
router.get('/download/pdf', auth, transactionReportController.downloadPdf);

// Export Excel
router.get('/export/excel', auth, transactionReportController.exportExcel);

module.exports = router;

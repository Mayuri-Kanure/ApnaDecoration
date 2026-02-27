const express = require('express');
const router = express.Router();
const { 
  getTicketStats,
  getRecentTickets
} = require('../controllers/supportDashboardController');
const { auth } = require('../middleware/auth');

// Support dashboard routes
router.get('/stats', auth, getTicketStats);
router.get('/recent', auth, getRecentTickets);

module.exports = router;

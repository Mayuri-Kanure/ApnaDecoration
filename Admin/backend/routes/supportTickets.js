const express = require('express');
const router = express.Router();
const { 
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  addReply,
  updateTicketStatus,
  deleteTicket
} = require('../controllers/supportTicketController');
const { auth } = require('../middleware/auth');

// Admin routes
router.get('/admin/all', auth, getAllTickets);
router.get('/admin/:id', auth, getTicketById);
router.put('/admin/:id/status', auth, updateTicketStatus);
router.delete('/admin/:id', auth, deleteTicket);

// User routes
router.get('/user', auth, getUserTickets);
router.get('/user/:id', auth, getTicketById);
router.post('/', auth, createTicket);
router.post('/:id/reply', auth, addReply);

module.exports = router;

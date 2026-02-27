const express = require('express');
const { authMiddleware, rbacMiddleware } = require('../middleware/auth');
const { supportController, adminSupportController } = require('../controllers/supportController');

const router = express.Router();

// User support routes
router.post('/tickets', 
  authMiddleware, 
  rbacMiddleware.userOnly, 
  supportController.createTicket
);

router.get('/tickets', 
  authMiddleware, 
  rbacMiddleware.userOnly, 
  supportController.getUserTickets
);

router.get('/tickets/:ticketId', 
  authMiddleware, 
  rbacMiddleware.userOnly, 
  supportController.getTicketDetails
);

router.post('/tickets/:ticketId/reply', 
  authMiddleware, 
  rbacMiddleware.userOnly, 
  supportController.replyToTicket
);

router.put('/tickets/:ticketId/close', 
  authMiddleware, 
  rbacMiddleware.userOnly, 
  supportController.closeTicket
);

// Admin support routes
router.get('/admin/tickets', 
  authMiddleware, 
  rbacMiddleware.adminOnly, 
  adminSupportController.getAllTickets
);

router.put('/admin/tickets/:ticketId/assign', 
  authMiddleware, 
  rbacMiddleware.adminOnly, 
  adminSupportController.assignTicket
);

router.post('/admin/tickets/:ticketId/reply', 
  authMiddleware, 
  rbacMiddleware.adminOnly, 
  adminSupportController.adminReplyToTicket
);

router.put('/admin/tickets/:ticketId/resolve', 
  authMiddleware, 
  rbacMiddleware.adminOnly, 
  adminSupportController.resolveTicket
);

module.exports = router;

const { SupportTicket, TicketMessage, User, Order } = require('../models');
const { Op } = require('sequelize');

const supportController = {
  // Create new support ticket
  createTicket: async (req, res) => {
    try {
      const {
        subject,
        category,
        orderId,
        priority = 'medium',
        description
      } = req.body;

      // Validate order if provided
      if (orderId) {
        const order = await Order.findOne({
          where: { 
            id: orderId,
            userId: req.user.id 
          }
        });

        if (!order) {
          return res.status(404).json({
            success: false,
            error: 'Order not found'
          });
        }
      }

      // Generate ticket ID
      const ticketId = `TKT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create support ticket
      const ticket = await SupportTicket.create({
        id: ticketId,
        userId: req.user.id,
        orderId: orderId || null,
        subject,
        category,
        priority,
        description,
        status: 'open'
      });

      // Create initial message
      await TicketMessage.create({
        ticketId: ticket.id,
        senderId: req.user.id,
        senderType: 'user',
        message: description
      });

      // Notify admin
      await notifyAdmin('new_ticket', {
        ticketId: ticket.id,
        subject,
        category,
        priority
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: {
          ticketId: ticket.id,
          status: ticket.status
        }
      });

    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create support ticket'
      });
    }
  },

  // Get user's support tickets
  getUserTickets: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, category } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { userId: req.user.id };
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;

      const tickets = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'eventDate', 'eventType', 'orderStatus'],
            required: false
          },
          {
            model: TicketMessage,
            as: 'messages',
            attributes: ['id', 'message', 'senderType', 'createdAt'],
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          tickets: tickets.rows,
          pagination: {
            total: tickets.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(tickets.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user tickets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch support tickets'
      });
    }
  },

  // Get ticket details with messages
  getTicketDetails: async (req, res) => {
    try {
      const { ticketId } = req.params;

      const ticket = await SupportTicket.findOne({
        where: { 
          id: ticketId,
          userId: req.user.id 
        },
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'eventDate', 'eventType', 'venueType', 'orderStatus'],
            include: [
              {
                model: OrderItem,
                as: 'items',
                attributes: ['id', 'productId', 'quantity', 'price'],
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'images']
                  }
                ]
              }
            ]
          },
          {
            model: TicketMessage,
            as: 'messages',
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'name', 'role']
              }
            ],
            order: [['createdAt', 'ASC']]
          }
        ]
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Mark messages as read
      await TicketMessage.update(
        { readAt: new Date() },
        {
          where: {
            ticketId: ticketId,
            senderType: 'admin',
            readAt: null
          }
        }
      );

      res.json({
        success: true,
        data: ticket
      });

    } catch (error) {
      console.error('Get ticket details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticket details'
      });
    }
  },

  // Reply to ticket
  replyToTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { message, attachments = [] } = req.body;

      const ticket = await SupportTicket.findOne({
        where: { 
          id: ticketId,
          userId: req.user.id 
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      if (['resolved', 'closed'].includes(ticket.status)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot reply to closed ticket'
        });
      }

      // Create message
      await TicketMessage.create({
        ticketId: ticket.id,
        senderId: req.user.id,
        senderType: 'user',
        message,
        attachments
      });

      // Update ticket status and last reply
      await ticket.update({
        status: 'in_progress',
        lastReplyBy: 'user'
      });

      // Notify admin
      await notifyAdmin('ticket_reply', {
        ticketId: ticket.id,
        message: message.substring(0, 100) + '...'
      });

      res.json({
        success: true,
        message: 'Reply sent successfully'
      });

    } catch (error) {
      console.error('Reply to ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send reply'
      });
    }
  },

  // Close ticket
  closeTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;

      const ticket = await SupportTicket.findOne({
        where: { 
          id: ticketId,
          userId: req.user.id 
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      if (ticket.status === 'closed') {
        return res.status(400).json({
          success: false,
          error: 'Ticket is already closed'
        });
      }

      await ticket.update({
        status: 'closed'
      });

      // Notify admin
      await notifyAdmin('ticket_closed', {
        ticketId: ticket.id
      });

      res.json({
        success: true,
        message: 'Ticket closed successfully'
      });

    } catch (error) {
      console.error('Close ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to close ticket'
      });
    }
  }
};

// Admin support controller
const adminSupportController = {
  // Get all support tickets (admin only)
  getAllTickets: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category, priority, assignedTo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (category) whereClause.category = category;
      if (priority) whereClause.priority = priority;
      if (assignedTo) whereClause.assignedTo = assignedTo;

      const tickets = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'eventDate', 'eventType', 'orderStatus'],
            required: false
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: TicketMessage,
            as: 'messages',
            attributes: ['id', 'message', 'senderType', 'createdAt'],
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          tickets: tickets.rows,
          pagination: {
            total: tickets.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(tickets.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch support tickets'
      });
    }
  },

  // Assign ticket to admin
  assignTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { adminId } = req.body;

      const ticket = await SupportTicket.findByPk(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      const admin = await User.findByPk(adminId);
      if (!admin || admin.role !== 'admin') {
        return res.status(400).json({
          success: false,
          error: 'Invalid admin assignment'
        });
      }

      await ticket.update({
        assignedTo: adminId,
        status: 'in_progress'
      });

      // Notify assigned admin
      await notifyAdmin('ticket_assigned', {
        ticketId: ticket.id,
        adminId: adminId
      });

      res.json({
        success: true,
        message: 'Ticket assigned successfully'
      });

    } catch (error) {
      console.error('Assign ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign ticket'
      });
    }
  },

  // Reply to ticket (admin)
  adminReplyToTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { message, attachments = [], internalNote = false } = req.body;

      const ticket = await SupportTicket.findByPk(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Create message
      await TicketMessage.create({
        ticketId: ticket.id,
        senderId: req.user.id,
        senderType: 'admin',
        message,
        attachments,
        internalNote
      });

      // Update ticket
      await ticket.update({
        status: 'pending_user',
        lastReplyBy: 'admin',
        assignedTo: req.user.id
      });

      // Notify user (if not internal note)
      if (!internalNote) {
        await notifyUser('ticket_reply', {
          ticketId: ticket.id,
          message: message.substring(0, 100) + '...'
        }, ticket.userId);
      }

      res.json({
        success: true,
        message: 'Reply sent successfully'
      });

    } catch (error) {
      console.error('Admin reply error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send reply'
      });
    }
  },

  // Resolve ticket
  resolveTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { resolution, refundAmount } = req.body;

      const ticket = await SupportTicket.findByPk(ticketId, {
        include: [
          {
            model: Order,
            as: 'order',
            required: false
          }
        ]
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found'
        });
      }

      // Process refund if applicable
      if (refundAmount && ticket.order) {
        await processRefund(ticket.order.id, refundAmount);
      }

      await ticket.update({
        status: 'resolved',
        resolution,
        refundAmount,
        refundProcessed: refundAmount ? true : false,
        assignedTo: req.user.id
      });

      // Notify user
      await notifyUser('ticket_resolved', {
        ticketId: ticket.id,
        resolution
      }, ticket.userId);

      res.json({
        success: true,
        message: 'Ticket resolved successfully'
      });

    } catch (error) {
      console.error('Resolve ticket error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resolve ticket'
      });
    }
  }
};

// Helper functions
const notifyAdmin = async (type, data) => {
  // Send notification to admin users
  console.log(`Admin notification: ${type}`, data);
};

const notifyUser = async (type, data, userId) => {
  // Send notification to user
  console.log(`User notification: ${type}`, data, userId);
};

const processRefund = async (orderId, amount) => {
  // Process refund through payment gateway
  console.log(`Refund of ${amount} processed for order ${orderId}`);
};

module.exports = {
  supportController,
  adminSupportController
};

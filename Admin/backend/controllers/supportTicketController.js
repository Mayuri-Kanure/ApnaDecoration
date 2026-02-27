const SupportTicket = require('../models/SupportTicket');
const cloudinaryService = require('../services/cloudinaryService');
const fs = require('fs');

// Get all support tickets (admin only)
exports.getAllTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, priority, search } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// Get user's support tickets
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    
    // Build query
    const query = { userId };
    if (status) query.status = status;
    
    // Execute query with pagination
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await SupportTicket.countDocuments(query);
    
    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// Get single support ticket
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('replies.userId', 'username email');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// Create new support ticket
exports.createTicket = async (req, res) => {
  try {
    console.log('🔍 req.files:', req.files);
    
    const { subject, category, priority, description, orderId } = req.body;
    
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.attachments) {
      const uploader = cloudinaryService.getUploader('apna-decoration/support-attachments', 5);
      
      for (const file of req.files.attachments) {
        const attachment = {
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          url: file.path || file.secure_url || file.url,
          size: file.size,
          uploadedAt: new Date()
        };
        attachments.push(attachment);
      }
    }
    
    const ticketData = {
      ticketId: ticketId, // Add the generated ticketId
      subject,
      category,
      priority: priority || 'medium',
      description,
      orderId: orderId || '',
      userId: req.user.id,
      userName: req.user.username,
      userEmail: req.user.email,
      status: 'open',
      attachments
    };
    
    const ticket = new SupportTicket(ticketData);
    await ticket.save();
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket',
      error: error.message
    });
  }
};

// Add reply to support ticket
exports.addReply = async (req, res) => {
  try {
    const { ticketId, message } = req.body;
    
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const replyData = {
      message,
      userId: req.user.id,
      userName: req.user.username,
      isStaff: req.user.role === 'admin',
      createdAt: new Date()
    };
    
    ticket.replies.push(replyData);
    ticket.updatedAt = new Date();
    
    // Update status based on who is replying
    if (req.user.role === 'admin') {
      ticket.status = 'in-progress';
    }
    
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Reply added successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
};

// Delete support ticket (admin only)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: error.message
    });
  }
};

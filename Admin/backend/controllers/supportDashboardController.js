const SupportTicket = require('../models/SupportTicket');

// Get support ticket statistics
exports.getTicketStats = async (req, res) => {
  try {
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total counts
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in-progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    
    res.json({
      success: true,
      data: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        byStatus: stats[0],
        byCategory: stats[1],
        byPriority: stats[2]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get recent tickets
exports.getRecentTickets = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tickets = await SupportTicket.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent tickets',
      error: error.message
    });
  }
};

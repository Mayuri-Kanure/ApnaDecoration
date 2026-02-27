const supportTicketService = {
  // Get all support tickets (admin)
  getAllTickets: async () => {
    try {
      // Simulate API call - replace with actual API call
      const response = {
        success: true,
        data: [
          {
            id: 1,
            ticketId: 'TK-001',
            subject: 'Order Delivery Issue',
            customerName: 'John Doe',
            email: 'john@example.com',
            priority: 'high',
            status: 'open',
            createdAt: '2024-01-15 10:30 AM',
            lastUpdated: '2024-01-15 11:00 AM'
          },
          {
            id: 2,
            ticketId: 'TK-002',
            subject: 'Product Quality Complaint',
            customerName: 'Jane Smith',
            email: 'jane@example.com',
            priority: 'medium',
            status: 'open',
            createdAt: '2024-01-15 09:15 AM',
            lastUpdated: '2024-01-15 10:30 AM'
          },
          {
            id: 3,
            ticketId: 'TK-003',
            subject: 'Refund Request',
            customerName: 'Bob Johnson',
            email: 'bob@example.com',
            priority: 'low',
            status: 'close',
            createdAt: '2024-01-14 03:45 PM',
            lastUpdated: '2024-01-15 09:00 AM'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          pages: 1
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  // Get single support ticket
  getTicketById: async (ticketId) => {
    try {
      const response = {
        success: true,
        data: {
          id: 1,
          ticketId: 'TK-001',
          subject: 'Order Delivery Issue',
          customerName: 'John Doe',
          email: 'john@example.com',
          priority: 'high',
          status: 'open',
          createdAt: '2024-01-15 10:30 AM',
          lastUpdated: '2024-01-15 11:00 AM'
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Create new support ticket
  createTicket: async (ticketData) => {
    try {
      const response = {
        success: true,
        data: {
          id: 4,
          ticketId: 'TK-004',
          subject: ticketData.subject,
          customerName: 'Admin User',
          email: 'admin@apnadecoration.com',
          priority: ticketData.priority,
          status: 'open',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Add reply to support ticket
  addReply: async (ticketId, message) => {
    try {
      const response = {
        success: true,
        data: {
          id: 1,
          ticketId: 'TK-001',
          subject: 'Order Delivery Issue',
          customerName: 'John Doe',
          email: 'john@example.com',
          priority: 'high',
          status: 'open',
          createdAt: '2024-01-15 10:30 AM',
          lastUpdated: '2024-01-15 11:00 AM',
          replies: [
            {
              message: message,
              userId: 'admin',
              userName: 'Support Team',
              isStaff: true,
              createdAt: new Date().toISOString()
            }
          ]
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error adding reply:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = {
        success: true,
        data: {
          id: 1,
          ticketId: 'TK-001',
          subject: 'Order Delivery Issue',
          customerName: 'John Doe',
          email: 'john@example.com',
          priority: 'high',
          status: status,
          createdAt: '2024-01-15 10:30 AM',
          lastUpdated: new Date().toISOString()
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return {
        success: false,
        data: null
      };
    }
  },

  // Delete support ticket
  deleteTicket: async (ticketId) => {
    try {
      const response = {
        success: true,
        data: {
          message: 'Ticket deleted successfully'
        }
      };
      
      return response;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return {
        success: false,
        data: null
      };
    }
  }
};

module.exports = supportTicketService;

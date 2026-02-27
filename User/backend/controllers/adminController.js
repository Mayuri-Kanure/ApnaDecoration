const { Product, Vendor, Order, OrderItem, User, SupportTicket } = require('../models');
const { Op } = require('sequelize');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const [
        totalOrders,
        totalUsers,
        totalVendors,
        totalProducts,
        recentOrders,
        pendingTickets,
        totalRevenue
      ] = await Promise.all([
        Order.count({ where: { orderStatus: { [Op.not]: 'cancelled' } } }),
        User.count({ where: { role: 'user' } }),
        Vendor.count({ where: { active: true } }),
        Product.count({ where: { status: 'active' } }),
        Order.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }),
        SupportTicket.count({ where: { status: 'open' } }),
        Order.sum('totalAmount', { where: { orderStatus: { [Op.not]: 'cancelled' } } })
      ]);

      res.json({
        success: true,
        data: {
          stats: {
            totalOrders,
            totalUsers,
            totalVendors,
            totalProducts,
            pendingTickets,
            totalRevenue: totalRevenue || 0
          },
          recentOrders
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // Get all orders (admin view)
  getAllOrders: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.orderStatus = status;
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'category']
              },
              {
                model: Vendor,
                as: 'vendor',
                attributes: ['id', 'name', 'phone']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          orders: orders.rows,
          pagination: {
            total: orders.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(orders.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, role, status, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (role) whereClause.role = role;
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          users: users.rows,
          pagination: {
            total: users.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(users.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  },

  // Get all vendors
  getAllVendors: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, verified, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.availabilityStatus = status;
      if (verified !== undefined) whereClause.verified = verified === 'true';
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { businessName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const vendors = await Vendor.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          vendors: vendors.rows,
          pagination: {
            total: vendors.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(vendors.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get all vendors error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendors'
      });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;

      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Validate status transition
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['ready', 'cancelled'],
        'ready': ['setup', 'cancelled'],
        'setup': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[order.orderStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from ${order.orderStatus} to ${status}`
        });
      }

      await order.update({
        orderStatus: status,
        adminNotes: notes || order.adminNotes
      });

      // Notify user
      await notifyUser('order_status_update', {
        orderId: order.id,
        status,
        notes
      }, order.user.id);

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { orderStatus: status }
      });

    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  },

  // Manage vendor status
  updateVendorStatus: async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { verified, active, availabilityStatus } = req.body;

      const vendor = await Vendor.findByPk(vendorId);
      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: 'Vendor not found'
        });
      }

      await vendor.update({
        verified: verified !== undefined ? verified : vendor.verified,
        active: active !== undefined ? active : vendor.active,
        availabilityStatus: availabilityStatus || vendor.availabilityStatus
      });

      res.json({
        success: true,
        message: 'Vendor status updated successfully',
        data: vendor
      });

    } catch (error) {
      console.error('Update vendor status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update vendor status'
      });
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const revenue = await Order.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
          orderStatus: { [Op.not]: 'cancelled' }
        },
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
          [require('sequelize').fn('SUM', require('sequelize').col('totalAmount')), 'revenue'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'orders']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
      });

      const categoryRevenue = await Order.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
          orderStatus: { [Op.not]: 'cancelled' }
        },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['category']
              }
            ]
          }
        ]
      });

      // Process category revenue
      const categoryStats = {};
      categoryRevenue.forEach(order => {
        order.items.forEach(item => {
          const category = item.product.category;
          if (!categoryStats[category]) {
            categoryStats[category] = { revenue: 0, count: 0 };
          }
          categoryStats[category].revenue += item.totalPrice;
          categoryStats[category].count += 1;
        });
      });

      res.json({
        success: true,
        data: {
          dailyRevenue: revenue,
          categoryStats
        }
      });

    } catch (error) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics'
      });
    }
  }
};

// Helper functions
const notifyUser = async (type, data, userId) => {
  // Send notification to user
  console.log(`User notification: ${type}`, data, userId);
};

module.exports = adminController;

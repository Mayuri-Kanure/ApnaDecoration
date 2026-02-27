const { OrderItem, Order, Vendor, SetupSchedule, Product } = require('../models');
const { Op } = require('sequelize');

const vendorController = {
  // Get vendor's assigned orders
  getVendorOrders: async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { vendorId: req.user.id };
      if (status) whereClause.itemStatus = status;

      const orderItems = await OrderItem.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'eventDate', 'eventTime', 'venueType', 'venueAddress', 'setupRequired', 'orderStatus'],
            include: [
              {
                model: OrderItem,
                as: 'items',
                attributes: ['id', 'productId', 'quantity', 'price', 'itemStatus'],
                where: { vendorId: req.user.id }
              }
            ]
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'description', 'images', 'setupRequired', 'setupTime']
          },
          {
            model: SetupSchedule,
            as: 'schedules',
            attributes: ['id', 'scheduledDate', 'startTime', 'endTime', 'status']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          orderItems: orderItems.rows,
          pagination: {
            total: orderItems.count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(orderItems.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get vendor orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  },

  // Get order item details
  getOrderItemDetails: async (req, res) => {
    try {
      const { orderItemId } = req.params;

      const orderItem = await OrderItem.findOne({
        where: { 
          id: orderItemId,
          vendorId: req.user.id 
        },
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'eventDate', 'eventTime', 'venueType', 'venueAddress', 'guestCount', 'specialInstructions'],
            include: [
              {
                model: OrderItem,
                as: 'items',
                attributes: ['id', 'productId', 'quantity', 'price', 'itemStatus'],
                where: { vendorId: req.user.id }
              }
            ]
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'description', 'images', 'specifications', 'features', 'setupRequired', 'setupTime']
          },
          {
            model: SetupSchedule,
            as: 'schedules',
            attributes: ['id', 'scheduledDate', 'startTime', 'endTime', 'status', 'setupTeam', 'equipment', 'notes']
          }
        ]
      });

      if (!orderItem) {
        return res.status(404).json({
          success: false,
          error: 'Order item not found'
        });
      }

      res.json({
        success: true,
        data: orderItem
      });

    } catch (error) {
      console.error('Get order item details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order item details'
      });
    }
  },

  // Update order item status
  updateOrderItemStatus: async (req, res) => {
    try {
      const { orderItemId } = req.params;
      const { status, notes } = req.body;

      const orderItem = await OrderItem.findOne({
        where: { 
          id: orderItemId,
          vendorId: req.user.id 
        },
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'userId', 'orderStatus']
          }
        ]
      });

      if (!orderItem) {
        return res.status(404).json({
          success: false,
          error: 'Order item not found'
        });
      }

      // Validate status transition
      const validTransitions = {
        'pending': ['accepted', 'cancelled'],
        'accepted': ['preparing', 'cancelled'],
        'preparing': ['prepared', 'cancelled'],
        'prepared': ['ready_for_setup', 'cancelled'],
        'ready_for_setup': ['setup_scheduled', 'cancelled'],
        'setup_scheduled': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      };

      if (!validTransitions[orderItem.itemStatus].includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status transition from ${orderItem.itemStatus} to ${status}`
        });
      }

      // Update order item
      await orderItem.update({
        itemStatus: status,
        vendorNotes: notes || orderItem.vendorNotes
      });

      // Update setup schedule if applicable
      if (status === 'completed' && orderItem.setupAssigned) {
        await SetupSchedule.update(
          { 
            status: 'completed',
            completedAt: new Date()
          },
          {
            where: { orderItemId: orderItem.id }
          }
        );
      }

      // Update overall order status based on all items
      await updateOrderStatus(orderItem.orderId);

      // Notify user
      await notifyUser('order_status_update', {
        orderId: orderItem.order.id,
        itemStatus: status,
        productName: orderItem.product.name
      }, orderItem.order.userId);

      // Notify admin
      await notifyAdmin('vendor_status_update', {
        orderItemId: orderItem.id,
        status,
        vendorId: req.user.id
      });

      res.json({
        success: true,
        message: 'Order item status updated successfully',
        data: {
          itemStatus: status
        }
      });

    } catch (error) {
      console.error('Update order item status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order item status'
      });
    }
  },

  // Get vendor availability
  getVendorAvailability: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = { vendorId: req.user.id };
      
      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate
        };
      }

      const availability = await VendorAvailability.findAll({
        where: whereClause,
        order: [['date', 'ASC']]
      });

      res.json({
        success: true,
        data: availability
      });

    } catch (error) {
      console.error('Get vendor availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch availability'
      });
    }
  },

  // Update vendor availability
  updateVendorAvailability: async (req, res) => {
    try {
      const { date, timeSlots, status, maxOrders, blockedReason } = req.body;

      const [availability, created] = await VendorAvailability.findOrCreate({
        where: {
          vendorId: req.user.id,
          date
        },
        defaults: {
          timeSlots,
          status,
          maxOrders,
          blockedReason
        }
      });

      if (!created) {
        await availability.update({
          timeSlots,
          status,
          maxOrders,
          blockedReason,
          lastUpdated: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: availability
      });

    } catch (error) {
      console.error('Update vendor availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update availability'
      });
    }
  },

  // Get setup schedules
  getSetupSchedules: async (req, res) => {
    try {
      const { date, status } = req.query;

      const whereClause = { vendorId: req.user.id };
      if (date) whereClause.scheduledDate = date;
      if (status) whereClause.status = status;

      const schedules = await SetupSchedule.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'orderItem',
            attributes: ['id', 'quantity', 'totalPrice'],
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'images']
              },
              {
                model: Order,
                as: 'order',
                attributes: ['id', 'eventDate', 'venueType', 'venueAddress', 'specialInstructions']
              }
            ]
          }
        ],
        order: [['scheduledDate', 'ASC'], ['startTime', 'ASC']]
      });

      res.json({
        success: true,
        data: schedules
      });

    } catch (error) {
      console.error('Get setup schedules error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch setup schedules'
      });
    }
  },

  // Update setup schedule
  updateSetupSchedule: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { status, setupTeam, equipment, notes, rescheduledReason } = req.body;

      const schedule = await SetupSchedule.findOne({
        where: { 
          id: scheduleId,
          vendorId: req.user.id 
        },
        include: [
          {
            model: OrderItem,
            as: 'orderItem',
            include: [
              {
                model: Order,
                as: 'order',
                attributes: ['id', 'userId']
              }
            ]
          }
        ]
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Setup schedule not found'
        });
      }

      await schedule.update({
        status,
        setupTeam,
        equipment,
        notes,
        rescheduledReason,
        vendorConfirmation: true,
        vendorConfirmedAt: new Date()
      });

      // Notify user and admin
      await notifyUser('setup_schedule_update', {
        scheduleId: schedule.id,
        status,
        date: schedule.scheduledDate
      }, schedule.orderItem.order.userId);

      await notifyAdmin('setup_schedule_update', {
        scheduleId: schedule.id,
        status,
        vendorId: req.user.id
      });

      res.json({
        success: true,
        message: 'Setup schedule updated successfully',
        data: schedule
      });

    } catch (error) {
      console.error('Update setup schedule error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update setup schedule'
      });
    }
  },

  // Get vendor profile
  getVendorProfile: async (req, res) => {
    try {
      const vendor = await Vendor.findOne({
        where: { userId: req.user.id },
        attributes: { exclude: ['password', 'bankAccountNumber'] }
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          error: 'Vendor profile not found'
        });
      }

      // Get statistics
      const stats = await getVendorStats(req.user.id);

      res.json({
        success: true,
        data: {
          vendor,
          stats
        }
      });

    } catch (error) {
      console.error('Get vendor profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor profile'
      });
    }
  }
};

// Helper functions
const updateOrderStatus = async (orderId) => {
  const orderItems = await OrderItem.findAll({
    where: { orderId },
    include: [
      {
        model: Order,
        as: 'order',
        attributes: ['orderStatus']
      }
    ]
  });

  const statuses = orderItems.map(item => item.itemStatus);
  
  let newStatus;
  if (statuses.every(status => status === 'cancelled')) {
    newStatus = 'cancelled';
  } else if (statuses.every(status => status === 'completed')) {
    newStatus = 'completed';
  } else if (statuses.some(status => ['preparing', 'prepared', 'ready_for_setup', 'setup_scheduled', 'completed'].includes(status))) {
    newStatus = 'processing';
  } else if (statuses.some(status => status === 'accepted')) {
    newStatus = 'confirmed';
  } else {
    newStatus = 'pending';
  }

  await Order.update(
    { orderStatus: newStatus },
    { where: { id: orderId } }
  );
};

const getVendorStats = async (vendorId) => {
  const totalOrders = await OrderItem.count({
    where: { vendorId }
  });

  const completedOrders = await OrderItem.count({
    where: { 
      vendorId,
      itemStatus: 'completed'
    }
  });

  const pendingOrders = await OrderItem.count({
    where: { 
      vendorId,
      itemStatus: { [Op.in]: ['pending', 'accepted', 'preparing'] }
    }
  });

  const todaySchedules = await SetupSchedule.count({
    where: {
      vendorId,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'scheduled'
    }
  });

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    todaySchedules,
    completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
  };
};

const notifyUser = async (type, data, userId) => {
  // Send notification to user
  console.log(`User notification: ${type}`, data, userId);
};

const notifyAdmin = async (type, data) => {
  // Send notification to admin
  console.log(`Admin notification: ${type}`, data);
};

module.exports = vendorController;

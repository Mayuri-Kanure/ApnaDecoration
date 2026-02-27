const Order = require('../models/Order');
const { validationResult } = require('express-validator');

exports.getOrders = async (req, res) => {
  try {
    // Temporarily disable authentication for testing
    console.log('🔍 ADMIN ORDERS REQUEST - Authentication temporarily disabled');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.orderStatus || req.query.status;
    const search = req.query.search;

    let query = {};
    
    // Handle status filtering - support both single status and array of statuses
    if (status && status !== 'all') {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // Calculate statistics
    const orderStats = await Order.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const revenueStats = await Order.aggregate([
      { $group: {
        _id: null,
        total: { $sum: '$pricing.total' },
        due: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$pricing.total', 0] } },
        settled: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$pricing.total', 0] } }
      }}
    ]);

    const paymentStats = await Order.aggregate([
      { $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        total: { $sum: '$pricing.total' }
      }}
    ]);

    const formattedPaymentStats = paymentStats.map(stat => {
      // Map payment method codes to readable names
      const paymentMethodMap = {
        'cod': 'Cash on Delivery',
        'cash': 'Cash',
        'card': 'Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'wallet': 'Wallet',
        null: 'Unknown',
        undefined: 'Unknown'
      };
      
      return {
        name: paymentMethodMap[stat._id] || stat._id || 'Unknown',
        value: stat.total || 0
      };
    });

    // Format statistics
    const formattedOrderStats = {
      total: total,
      completed: orderStats.find(s => s._id === 'delivered')?.count || 0,
      canceled: orderStats.find(s => s._id === 'cancelled')?.count || 0,
      pending: orderStats.find(s => s._id === 'pending')?.count || 0
    };

    const formattedRevenueStats = revenueStats[0] || {
      total: 0,
      due: 0,
      settled: 0
    };

    console.log('🔍 ADMIN ORDERS - Found orders:', orders.length);
    console.log('🔍 ADMIN ORDERS - Total count:', total);
    console.log('🔍 ADMIN ORDERS - Pagination pages:', Math.ceil(total / limit));

    res.json({
      orders,
      stats: {
        orders: formattedOrderStats,
        revenue: formattedRevenueStats,
        payments: formattedPaymentStats
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const orderData = req.body;
    
    const newOrder = await Order.create({
      ...orderData,
      status: 'pending',
      paymentStatus: orderData.paymentStatus || 'pending'
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const { status, notes } = orderData;
    
    // If status is being updated, add to timeline
    if (status) {
      const updateData = {
        ...orderData,
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: notes || '', // Use 'note' to match schema
            updatedBy: 'admin'
          }
        }
      };
      
      // Set actual delivery date if status is delivered
      if (status === 'delivered') {
        updateData.actualDelivery = new Date();
      }
      
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(updatedOrder);
    } else {
      // Regular update without status change
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        orderData,
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(updatedOrder);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const result = {
      byStatus: [
        { _id: 'pending', count: 0, revenue: 0 },
        { _id: 'processing', count: 0, revenue: 0 },
        { _id: 'completed', count: 0, revenue: 0 },
        { _id: 'cancelled', count: 0, revenue: 0 }
      ],
      total: 0,
      revenue: 0
    };

    stats.forEach(stat => {
      const statusIndex = result.byStatus.findIndex(s => s._id === stat._id);
      if (statusIndex !== -1) {
        result.byStatus[statusIndex] = stat;
      }
    });

    if (totalStats.length > 0) {
      result.total = totalStats[0].total;
      result.revenue = totalStats[0].revenue;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

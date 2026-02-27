const Order = require('../models/Order');

const getStartDateFromFilter = (timeFilter = 'thisMonth') => {
  const now = new Date();
  switch (timeFilter) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'thisWeek': {
      const day = now.getDay();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    }
    case 'thisMonth':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'thisYear':
      return new Date(now.getFullYear(), 0, 1);
    case 'lastYear':
      return new Date(now.getFullYear() - 1, 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

const getOrderAmount = (order) => Number(order?.totalAmount || order?.pricing?.total || 0);
const getOrderTax = (order) => Number(order?.taxAmount || order?.tax || order?.pricing?.tax || 0);
const getOrderCommission = (order) => Number(order?.commission || 0);

// Get admin earnings summary
const getAdminEarningsSummary = async (req, res) => {
  try {
    const { timeFilter = 'thisMonth' } = req.query;
    const startDate = getStartDateFromFilter(timeFilter);
    const dateFilter = { createdAt: { $gte: startDate } };

    // Calculate earnings summary
    const orders = await Order.find(dateFilter).lean();

    const totalRevenue = orders.reduce((sum, order) => sum + getOrderAmount(order), 0);
    const totalCommission = orders.reduce((sum, order) => sum + getOrderCommission(order), 0);
    const totalTax = orders.reduce((sum, order) => sum + getOrderTax(order), 0);
    const totalRefunds = orders
      .filter(order => order.status === 'refunded')
      .reduce((sum, order) => sum + getOrderAmount(order), 0);
    const netEarnings = totalRevenue - totalCommission - totalTax - totalRefunds;

    const summary = {
      totalRevenue,
      totalCommission,
      totalTax,
      totalRefunds,
      netEarnings,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching admin earnings summary:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get admin earnings chart data (monthly trends)
const getAdminEarningsChart = async (req, res) => {
  try {
    const { timeFilter = 'thisYear' } = req.query;
    const startDate = getStartDateFromFilter(timeFilter);
    const dateFilter = { createdAt: { $gte: startDate } };

    // Get monthly earnings data
    const monthlyData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
          totalCommission: { $sum: '$commission' },
          totalTax: {
            $sum: {
              $ifNull: [
                '$taxAmount',
                { $ifNull: ['$tax', { $ifNull: ['$pricing.tax', 0] }] }
              ]
            }
          },
          totalRefunds: {
            $sum: {
              $cond: [{ $eq: ['$status', 'refunded'] }, { $ifNull: ['$totalAmount', 0] }, 0]
            }
          },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format data for frontend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyData.map(item => ({
      month: monthNames[item._id - 1] || 'Unknown',
      earnings: item.totalRevenue - item.totalCommission - item.totalTax - item.totalRefunds,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching admin earnings chart:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get admin payment status breakdown
const getAdminPaymentStatus = async (req, res) => {
  try {
    const { timeFilter = 'thisMonth' } = req.query;
    const startDate = getStartDateFromFilter(timeFilter);
    const dateFilter = { createdAt: { $gte: startDate } };

    // Get payment method statistics
    const paymentStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } }
        }
      }
    ]);

    // Calculate total for percentage calculation
    const totalOrders = paymentStats.reduce((sum, stat) => sum + stat.count, 0);

    // Format payment status data
    const paymentStatusData = paymentStats.map(stat => {
      const methodKey = String(stat._id || '').trim().toLowerCase();
      let name = stat._id || 'Other';
      let color = '#757575'; // Default gray
      
      // Normalize payment method names and assign colors
      switch (methodKey) {
        case 'cod':
        case 'cash':
        case 'cashondelivery':
        case 'cash-on-delivery':
        case 'cash_on_delivery':
          name = 'Cash';
          color = '#4CAF50';
          break;
        case 'razorpay':
        case 'upi':
        case 'online':
        case 'online_payment':
        case 'online-payment':
        case 'pay_online':
        case 'pay-online':
        case 'net_banking':
        case 'net-banking':
        case 'card':
        case 'credit_card':
        case 'debit_card':
        case 'credit-card':
        case 'debit-card':
          name = 'Digital';
          color = '#2196F3';
          break;
        case 'wallet':
        case 'online_wallet':
          name = 'Wallet';
          color = '#9C27B0';
          break;
        case 'bank_transfer':
        case 'offline':
          name = 'Offline';
          color = '#FF9800';
          break;
        default:
          name = methodKey ? 'Other' : 'Unknown';
      }
      
      return {
        name,
        value: totalOrders > 0 ? Math.round((stat.count / totalOrders) * 100) : 0,
        count: stat.count,
        totalAmount: stat.totalAmount,
        color
      };
    });

    res.json(paymentStatusData);
  } catch (error) {
    console.error('Error fetching admin payment status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get admin total sales table data
const getAdminTotalSales = async (req, res) => {
  try {
    const { 
      timeFilter = 'thisMonth',
      page = 1,
      limit = 50
    } = req.query;
    
    const startDate = getStartDateFromFilter(timeFilter);
    const dateFilter = { createdAt: { $gte: startDate } };

    // Get orders with pagination
    const orders = await Order.find(dateFilter)
      .populate('customer', 'name firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(dateFilter);

    // Format sales data for frontend
    const salesData = orders.map(order => {
      const totalAmount = getOrderAmount(order);
      const commission = getOrderCommission(order);
      const vatTax = getOrderTax(order);
      const refundGiven = order.status === 'refunded' ? totalAmount : 0;
      const netEarning = totalAmount - commission - vatTax - refundGiven;

      let customerName = 'Guest User';
      const customer = order.customer;
      if (customer) {
        if (customer.firstName && customer.lastName) {
          customerName = `${customer.firstName} ${customer.lastName}`;
        } else if (customer.name) {
          customerName = customer.name;
        } else if (customer.email) {
          customerName = customer.email.split('@')[0];
        }
      }

      return {
        id: order._id,
        date: order.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        orderId: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        customerName,
        totalAmount,
        commission,
        vatTax,
        refundGiven,
        netEarning,
        paymentMethod: order.paymentMethod || 'Unknown',
        status: order.status
      };
    });

    res.json({
      sales: salesData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching admin total sales:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminEarningsSummary,
  getAdminEarningsChart,
  getAdminPaymentStatus,
  getAdminTotalSales
};

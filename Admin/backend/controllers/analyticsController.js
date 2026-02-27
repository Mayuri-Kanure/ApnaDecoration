const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const User = require('../models/User');
const DeliveryBoy = require('../models/Delivery');

exports.getPublicDashboardStats = async (req, res) => {
  try {
    console.log('=== PUBLIC DASHBOARD ANALYTICS API CALLED ===');
    
    // Get basic stats without authentication
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalStores
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'vendor' })
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalStores,
      totalRevenue: 0 // Hide revenue data for public access
    };

    console.log('Sending public dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getPublicDashboardStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('=== DASHBOARD ANALYTICS API CALLED ===');
    const { orderTimeRange, earningTimeRange } = req.query;
    const now = new Date();
    
    // Helper function to get date range
    const getDateRange = (range) => {
      const start = new Date(now);
      
      switch (range) {
        case 'thisWeek':
          start.setDate(now.getDate() - now.getDay());
          break;
        case 'thisMonth':
          start.setDate(1);
          break;
        case 'thisQuarter':
          start.setMonth(Math.floor(now.getMonth() / 3) * 3);
          start.setDate(1);
          break;
        case 'thisYear':
          start.setMonth(0);
          start.setDate(1);
          break;
        case 'lastWeek':
          start.setDate(now.getDate() - now.getDay() - 7);
          break;
        case 'lastMonth':
          start.setMonth(now.getMonth() - 1);
          start.setDate(1);
          break;
        case 'lastQuarter':
          start.setMonth((Math.floor(now.getMonth() / 3) - 1) * 3);
          start.setDate(1);
          break;
        case 'lastYear':
          start.setMonth(now.getMonth() - 12);
          start.setDate(1);
          break;
        default:
          start.setDate(1); // Default to this month
      }
      
      return start;
    };
    
    // Get order date range
    const orderStartDate = getDateRange(orderTimeRange || 'thisMonth');
    const orderEndDate = new Date(now);
    
    // Get earning date range
    const earningStartDate = getDateRange(earningTimeRange || 'thisMonth');
    const earningEndDate = new Date(now);
    
    // For last month comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      ordersThisRange,
      ordersLastMonth,
      totalCustomers,
      customersThisMonth,
      totalProducts,
      totalStores,
      lowStockCount,
      orderStats,
      userStats,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: orderStartDate } }),
      Order.countDocuments({ 
        createdAt: { 
          $gte: lastMonthStart, 
          $lte: lastMonthEnd 
        } 
      }),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: orderStartDate } }),
      Product.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments({
        stock: { $lte: 10 } // Low stock threshold - fixed field name
      }),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
    ]);

    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          thisRange: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', earningStartDate] },
                '$totalAmount',
                0
              ]
            }
          },
          lastMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', lastMonthStart] },
                    { $lte: ['$createdAt', lastMonthEnd] }
                  ]
                },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Process user statistics
    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
    const adminCount = userStats.find(s => s._id === 'admin')?.count || 0;
    const managerCount = userStats.find(s => s._id === 'manager')?.count || 0;
    const staffCount = userStats.find(s => s._id === 'staff')?.count || 0;

    console.log('Dashboard stats calculated:', {
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount
    });

    const stats = {
      totalOrders,
      ordersThisRange,
      ordersLastMonth,
      totalRevenue: revenueStats[0]?.total || 0,
      revenueThisRange: revenueStats[0]?.thisRange || 0,
      revenueLastMonth: revenueStats[0]?.lastMonth || 0,
      totalCustomers,
      customersThisMonth,
      totalProducts,
      totalStores,
      lowStockCount,
      pendingOrders: orderStats.find(s => s._id === 'pending')?.count || 0,
      processingOrders: orderStats.find(s => s._id === 'processing')?.count || 0,
      completedOrders: orderStats.find(s => s._id === 'completed')?.count || 0,
      cancelledOrders: orderStats.find(s => s._id === 'cancelled')?.count || 0,
      orderBreakdown: {
        pending: orderStats.find(s => s._id === 'pending')?.count || 0,
        confirmed: orderStats.find(s => s._id === 'confirmed')?.count || 0,
        packaging: orderStats.find(s => s._id === 'packaging')?.count || 0,
        delivered: orderStats.find(s => s._id === 'delivered')?.count || 0,
        canceled: orderStats.find(s => s._id === 'canceled')?.count || 0,
        returned: orderStats.find(s => s._id === 'returned')?.count || 0,
        outForDelivery: orderStats.find(s => s._id === 'out_for_delivery')?.count || 0,
        failedToDeliver: orderStats.find(s => s._id === 'failed_to_deliver')?.count || 0
      },
      userOverview: {
        totalCustomers: totalCustomers,
        totalVendors: totalStores,
        totalDeliveryMen: await DeliveryBoy.countDocuments(),
        totalUsers: totalUsers
      },
      topCustomers: await User.find({ role: 'user' })
        .select('name email username')
        .limit(6)
        .then(users => users.map(u => ({
          name: u.name || u.username || 'Unknown',
          avatar: (u.name || u.username || 'U').substring(0, 2).toUpperCase(),
          orders: 0
        }))),
      popularStores: await User.find({ role: 'vendor' })
        .select('name email username')
        .limit(6)
        .then(vendors => vendors.map(v => ({
          name: v.name || v.username || v.email,
          orders: 0
        }))),
      topSellingStore: await User.findOne({ role: 'vendor' })
        .select('name username email')
        .then(vendor => vendor ? {
          name: vendor.name || vendor.username || vendor.email,
          revenue: 0
        } : { name: 'No Store', revenue: 0 }),
      topDeliveryMan: await DeliveryBoy.findOne()
        .select('firstName lastName email')
        .then(delivery => delivery ? {
          name: `${delivery.firstName} ${delivery.lastName}`,
          avatar: `${delivery.firstName[0]}${delivery.lastName[0]}`.toUpperCase(),
          delivered: delivery.successfulDeliveries || 0
        } : {
          name: 'No Delivery Man',
          avatar: 'ND',
          delivered: 0
        }),
      popularProducts: [],
      topSellingProducts: [],
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: order.customer?.name || 'Unknown',
        amount: order.totalAmount,
        status: order.status,
        date: order.createdAt
      }))
    };

    console.log('Sending dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSalesChart = async (req, res) => {
  try {
    console.log('=== SALES CHART API CALLED ===');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('Sales chart data:', salesData);
    res.json({
      data: salesData,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: salesData.length
      }
    });
  } catch (error) {
    console.error('Error in getSalesChart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    console.log('=== TOP PRODUCTS API CALLED ===');
    
    // Since Order schema might not have items array, let's get top products by sales count
    const topProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $in: ['$$productId', '$items.product'] 
                } 
              } 
            }
          ],
          as: 'orders'
        }
      },
      {
        $project: {
          name: '$product_name_en',
          sales: { $size: '$orders' },
          revenue: { 
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.pricing.total'
              }
            }
          },
          _id: 0
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    console.log('Top products:', topProducts);
    res.json(topProducts);
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRevenueByCategory = async (req, res) => {
  try {
    console.log('=== REVENUE BY CATEGORY API CALLED ===');
    
    // Get revenue by category using Product and Order collections
    const revenueByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $in: ['$$productId', '$items.product'] 
                } 
              } 
            }
          ],
          as: 'orders'
        }
      },
      {
        $group: {
          _id: '$category_id',
          revenue: { 
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.pricing.total'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          category: '$_id',
          revenue: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log('Revenue by category:', revenueByCategory);
    res.json(revenueByCategory);
  } catch (error) {
    console.error('Error in getRevenueByCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    console.log('=== REVENUE CHART API CALLED ===');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('Revenue chart data:', revenueData);
    res.json(revenueData);
  } catch (error) {
    console.error('Error in getRevenueChart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderStatusChart = async (req, res) => {
  try {
    console.log('=== ORDER STATUS CHART API CALLED ===');
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('Order status chart data:', statusData);
    res.json(statusData);
  } catch (error) {
    console.error('Error in getOrderStatusChart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTopCustomers = async (req, res) => {
  try {
    console.log('=== TOP CUSTOMERS API CALLED ===');
    
    // Simplified top customers based on order count
    const topCustomers = await Customer.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'customer',
          as: 'orders'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          company: 1,
          totalOrders: { $size: '$orders' },
          totalSpent: { 
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.pricing.total'
              }
            }
          }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 3 }
    ]);

    console.log('Top customers:', topCustomers);
    res.json(topCustomers);
  } catch (error) {
    console.error('Error in getTopCustomers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get inhouse sales data
exports.getInhouseSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    // Build filter
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Get orders with inhouse products
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Extract product IDs and fetch product data separately
    const productIds = [];
    for (const order of orders) {
      for (const item of order.items || []) {
        if (item.productModel === 'Product' && item.product) {
          productIds.push(item.product);
        }
      }
    }

    // Fetch products separately
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    const total = await Order.countDocuments(filter);
    
    // Extract inhouse product sales
    const salesData = [];
    const productSales = new Map();
    
    for (const order of orders) {
      for (const item of order.items || []) {
        // Only include inhouse products
        if (item.productModel !== 'Product') continue;
        
        const productId = item.product?.toString();
        if (!productId) continue;
        
        if (!productSales.has(productId)) {
          const product = productMap[productId];
          productSales.set(productId, {
            _id: productId,
            productName: product?.name || 'Unknown Product',
            category: product?.category || 'Uncategorized',
            sales: 0,
            revenue: 0,
            date: order.createdAt
          });
        }
        
        const productStats = productSales.get(productId);
        productStats.sales += 1;
        productStats.revenue += item.totalPrice || 0;
      }
    }
    
    const sales = Array.from(productSales.values());
    
    res.json({
      sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: sales.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get inhouse categories
exports.getInhouseCategories = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find({}, 'category').lean();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    const formattedCategories = categories.map((cat, index) => ({
      _id: (index + 1).toString(),
      name: cat
    }));
    
    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

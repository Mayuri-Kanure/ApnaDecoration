const { Order, Product, User } = require('../models');

const vendorAnalyticsController = {
  // Get vendor dashboard analytics
  getDashboardAnalytics: async (req, res) => {
    try {
      const vendorId = req.user.userId || req.user.id || req.user._id;
      
      if (!vendorId) {
        return res.status(401).json({
          success: false,
          error: "Vendor not authenticated"
        });
      }

      console.log('📊 Getting dashboard analytics for vendor:', vendorId);

      // Get vendor's products first (since items.vendor is not populated in orders)
      const VendorProduct = require('../models/VendorProduct');
      const vendorProducts = await VendorProduct.find({
        vendor: vendorId
      }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id);

      console.log('📦 Vendor product IDs:', vendorProductIds);

      if (vendorProductIds.length === 0) {
        return res.json({
          success: true,
          data: {
            stats: {
              todayRevenue: 0,
              totalOrders: 0,
              pendingOrders: 0,
              totalProducts: 0
            },
            lowStockProducts: []
          }
        });
      }

      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayOrders = await Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct",
        status: 'delivered'
      });

      const todayRevenue = todayOrders.reduce((sum, order) => {
        const vendorItems = order.items.filter(item => 
          item.productModel === "VendorProduct" && 
          vendorProductIds.some(id => id.toString() === item.product.toString())
        );
        return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.totalPrice || 0), 0);
      }, 0);

      // Get total orders count
      const totalOrders = await Order.countDocuments({
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct"
      });

      // Get pending orders (for dashboard display only, not revenue)
      const pendingOrders = await Order.find({
        status: 'pending',
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct"
      });

      // Get total products count
      const totalProducts = vendorProducts.length;

      // Get low stock products
      const lowStockProducts = await VendorProduct.find({
        vendor: vendorId,
        stock: { $lte: 10 }
      }).sort({ stock: 1 }).limit(5);

      res.json({
        success: true,
        data: {
          stats: {
            todayRevenue: parseFloat(todayRevenue.toFixed(2)),
            totalOrders: totalOrders,
            pendingOrders: pendingOrders.length,
            totalProducts: totalProducts
          },
          lowStockProducts: lowStockProducts
        }
      });

    } catch (error) {
      console.error('❌ Get dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard analytics'
      });
    }
  },

  // Get revenue analytics with period filter
  getRevenueAnalytics: async (req, res) => {
    try {
      const vendorId = req.user.userId || req.user.id || req.user._id;
      const { period = '30' } = req.query;
      const days = parseInt(period);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          error: "Vendor not authenticated"
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Get vendor's products first
      const VendorProduct = require('../models/VendorProduct');
      const vendorProducts = await VendorProduct.find({
        vendor: vendorId
      }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id);

      if (vendorProductIds.length === 0) {
        return res.json({
          success: true,
          data: {
            dailyRevenue: [],
            totalRevenue: 0,
            totalOrders: 0
          }
        });
      }

      // Get all DELIVERED orders for vendor in the period (only count completed deliveries)
      const orders = await Order.find({
        createdAt: { $gte: startDate },
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct",
        status: 'delivered'
      });

      if (!orders || orders.length === 0) {
        return res.json({
          success: true,
          data: {
            dailyRevenue: [],
            totalRevenue: 0,
            totalOrders: 0
          }
        });
      }

      // Process daily revenue
      const revenueByDate = {};
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        if (!revenueByDate[date]) {
          revenueByDate[date] = { date, revenue: 0, orders: 0 };
        }
        const vendorItems = order.items.filter(item => 
          item.productModel === "VendorProduct" && 
          vendorProductIds.some(id => id.toString() === item.product.toString())
        );
        const itemsTotal = vendorItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        revenueByDate[date].revenue += itemsTotal;
        revenueByDate[date].orders += vendorItems.length > 0 ? 1 : 0;
      });

      const dailyData = Object.values(revenueByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      res.json({
        success: true,
        data: {
          dailyRevenue: dailyData,
          totalRevenue: dailyData.reduce((sum, day) => sum + day.revenue, 0),
          totalOrders: dailyData.reduce((sum, day) => sum + day.orders, 0)
        }
      });

    } catch (error) {
      console.error('❌ Get revenue analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics'
      });
    }
  },

  // Get sales by product
  getProductSalesAnalytics: async (req, res) => {
    try {
      const vendorId = req.user.userId || req.user.id || req.user._id;
      const { period = '30' } = req.query;
      const days = parseInt(period);

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          error: "Vendor not authenticated"
        });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get vendor's products first
      const VendorProduct = require('../models/VendorProduct');
      const vendorProducts = await VendorProduct.find({
        vendor: vendorId
      }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id);

      if (vendorProductIds.length === 0) {
        return res.json({
          success: true,
          data: {
            topProducts: []
          }
        });
      }

      // Get all DELIVERED orders for vendor in the period (only count completed deliveries)
      const orders = await Order.find({
        createdAt: { $gte: startDate },
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct",
        status: 'delivered'
      });

      if (!orders || orders.length === 0) {
        return res.json({
          success: true,
          data: {
            topProducts: []
          }
        });
      }

      // Aggregate by product
      const productStats = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productModel === "VendorProduct" && 
              vendorProductIds.some(id => id.toString() === item.product.toString())) {
            const productId = item.product.toString();
            if (!productStats[productId]) {
              productStats[productId] = {
                productId,
                name: item.specifications?.name || item.productSnapshot?.name || 'Unknown',
                totalQuantity: 0,
                totalRevenue: 0,
                orders: 0
              };
            }
            productStats[productId].totalQuantity += item.quantity || 0;
            productStats[productId].totalRevenue += item.totalPrice || 0;
            productStats[productId].orders += 1;
          }
        });
      });

      const topProducts = Object.values(productStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          topProducts
        }
      });

    } catch (error) {
      console.error('❌ Get product sales analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product sales analytics'
      });
    }
  },

  // Get earnings summary
  getEarningsSummary: async (req, res) => {
    try {
      const vendorId = req.user.userId || req.user.id || req.user._id;

      if (!vendorId) {
        return res.status(401).json({
          success: false,
          error: "Vendor not authenticated"
        });
      }

      // Get vendor's products first
      const VendorProduct = require('../models/VendorProduct');
      const vendorProducts = await VendorProduct.find({
        vendor: vendorId
      }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id);

      if (vendorProductIds.length === 0) {
        return res.json({
          success: true,
          data: {
            thisMonth: 0,
            lastMonth: 0,
            growth: 0,
            orders: 0
          }
        });
      }

      // This month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const thisMonthOrders = await Order.find({
        createdAt: { $gte: thisMonth },
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct",
        status: 'delivered'
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => {
        const vendorItems = order.items.filter(item => 
          item.productModel === "VendorProduct" && 
          vendorProductIds.some(id => id.toString() === item.product.toString())
        );
        return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.totalPrice || 0), 0);
      }, 0);

      // Last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      const lastMonthOrders = await Order.find({
        createdAt: { $gte: lastMonth, $lt: thisMonthStart },
        "items.product": { $in: vendorProductIds },
        "items.productModel": "VendorProduct",
        status: 'delivered'
      });

      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => {
        const vendorItems = order.items.filter(item => 
          item.productModel === "VendorProduct" && 
          vendorProductIds.some(id => id.toString() === item.product.toString())
        );
        return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.totalPrice || 0), 0);
      }, 0);

      const growth = lastMonthRevenue > 0 
        ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : 0;

      res.json({
        success: true,
        data: {
          thisMonth: parseFloat(thisMonthRevenue.toFixed(2)),
          lastMonth: parseFloat(lastMonthRevenue.toFixed(2)),
          growth: parseFloat(growth),
          orders: thisMonthOrders.length
        }
      });

    } catch (error) {
      console.error('❌ Get earnings summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch earnings summary'
      });
    }
  }
};

module.exports = vendorAnalyticsController;

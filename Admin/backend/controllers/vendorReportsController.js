const Order = require('../models/Order');
const User = require('../models/User');
const VendorProduct = require('../models/VendorProduct');

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
      return null;
  }
};

const getItemAmount = (item) => {
  if (typeof item?.totalPrice === 'number') return item.totalPrice;
  const qty = Number(item?.quantity || 0);
  const unit = Number(item?.unitPrice || 0);
  return qty * unit;
};

const getVendorProductMeta = async () => {
  const vendorProducts = await VendorProduct.find({}, '_id vendorId status').lean();
  const productToVendorMap = new Map();
  const vendorProductIds = [];
  const vendorIds = new Set();
  let approved = 0;
  let pending = 0;

  for (const vp of vendorProducts) {
    const productId = vp._id?.toString();
    const vendorId = vp.vendorId?.toString();
    if (!productId || !vendorId) continue;

    productToVendorMap.set(productId, vendorId);
    vendorProductIds.push(vp._id);
    vendorIds.add(vendorId);

    if (vp.status === 'approved') approved += 1;
    if (vp.status === 'pending') pending += 1;
  }

  return { productToVendorMap, vendorProductIds, vendorIds: Array.from(vendorIds), approved, pending };
};

// Get vendor summary data
const getVendorSummary = async (req, res) => {
  try {
    // Get real vendors
    const vendors = await User.find({ role: 'vendor' }).lean();
    const totalVendors = vendors.length;

    const { productToVendorMap, vendorProductIds, approved, pending } = await getVendorProductMeta();

    // Calculate vendor revenue from items that map to vendor products.
    let totalVendorRevenue = 0;
    if (vendorProductIds.length > 0) {
      const orders = await Order.find(
        { 'items.product': { $in: vendorProductIds } },
        { items: 1 }
      ).lean();

      for (const order of orders) {
        for (const item of order.items || []) {
          if (item?.productModel && item.productModel !== 'VendorProduct') continue;
          const vendorId = productToVendorMap.get(item.product?.toString());
          if (!vendorId) continue;
          totalVendorRevenue += getItemAmount(item);
        }
      }
    }

    const summary = {
      totalVendors,
      totalProducts: {
        approved,
        pending
      },
      walletStatus: {
        withdrawableBalance: totalVendorRevenue > 0 ? totalVendorRevenue : 0,
        pendingWithdrawals: 0, // Would need withdrawal tracking
        alreadyWithdrawn: 0 // Would need withdrawal tracking
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching vendor summary:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get vendor earnings data
const getVendorEarnings = async (req, res) => {
  try {
    const { timeFilter = 'thisYear' } = req.query;
    const startDate = getStartDateFromFilter(timeFilter);
    const dateMatch = startDate ? { createdAt: { $gte: startDate } } : {};
    const { vendorProductIds } = await getVendorProductMeta();

    if (vendorProductIds.length === 0) {
      return res.json([]);
    }

    // Get monthly earnings data for vendors
    const monthlyData = await Order.aggregate([
      { $match: dateMatch },
      { $unwind: '$items' },
      {
        $match: {
          $or: [
            { 'items.productModel': 'VendorProduct' },
            { 'items.product': { $in: vendorProductIds } }
          ]
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          earnings: {
            $sum: {
              $ifNull: [
                '$items.totalPrice',
                {
                  $multiply: [
                    { $ifNull: ['$items.unitPrice', 0] },
                    { $ifNull: ['$items.quantity', 0] }
                  ]
                }
              ]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format data for frontend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthlyData.map(item => ({
      month: monthNames[item._id - 1] || 'Unknown',
      earnings: item.earnings
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching vendor earnings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get vendor details table data
const getVendorDetails = async (req, res) => {
  try {
    const { timeFilter = 'thisMonth', page = 1, limit = 50 } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;

    const startDate = getStartDateFromFilter(timeFilter);
    const dateMatch = startDate ? { createdAt: { $gte: startDate } } : {};

    const roleVendors = await User.find({ role: 'vendor' }, 'name firstName lastName email').lean();
    const { productToVendorMap, vendorProductIds, vendorIds } = await getVendorProductMeta();

    // Include vendor owners from vendor products even if their role flag is inconsistent.
    const ownerVendors = vendorIds.length
      ? await User.find({ _id: { $in: vendorIds } }, 'name firstName lastName email').lean()
      : [];

    const vendorsById = new Map();
    for (const vendor of [...roleVendors, ...ownerVendors]) {
      vendorsById.set(vendor._id.toString(), vendor);
    }
    const vendors = Array.from(vendorsById.values());

    const statsMap = new Map();
    for (const vendor of vendors) {
      statsMap.set(vendor._id.toString(), {
        totalOrders: 0,
        totalRevenue: 0
      });
    }

    if (vendorProductIds.length > 0) {
      const orders = await Order.find(
        {
          ...dateMatch,
          'items.product': { $in: vendorProductIds }
        },
        { _id: 1, items: 1 }
      ).lean();

      for (const order of orders) {
        const vendorsInOrder = new Set();

        for (const item of order.items || []) {
          if (item?.productModel && item.productModel !== 'VendorProduct') continue;
          const vendorId = productToVendorMap.get(item.product?.toString());
          if (!vendorId || !statsMap.has(vendorId)) continue;

          vendorsInOrder.add(vendorId);
          const vendorStats = statsMap.get(vendorId);
          vendorStats.totalRevenue += getItemAmount(item);
        }

        for (const vendorId of vendorsInOrder) {
          const vendorStats = statsMap.get(vendorId);
          vendorStats.totalOrders += 1;
        }
      }
    }

    const vendorStats = vendors.map((vendor) => {
      const stats = statsMap.get(vendor._id.toString()) || { totalOrders: 0, totalRevenue: 0 };
      const commissionGiven = 0;
      const deliverymanIncentive = 0;
      const walletBalance = stats.totalRevenue - commissionGiven;

      return {
        id: vendor._id,
        vendorName: vendor.name || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Unknown Vendor',
        email: vendor.email,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        commissionGiven,
        deliverymanIncentive,
        walletBalance
      };
    });

    const total = vendorStats.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedVendorStats = vendorStats.slice(startIndex, startIndex + limitNum);

    res.json({
      vendors: paginatedVendorStats,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorSummary,
  getVendorEarnings,
  getVendorDetails
};

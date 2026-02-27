const Product = require('../models/Product');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

const buildDateRangeFilter = (timeFilter) => {
  const now = new Date();
  let createdAt = null;

  if (timeFilter === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    createdAt = { $gte: start, $lt: end };
  } else if (timeFilter === 'thisYear') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    createdAt = { $gte: start, $lt: end };
  } else if (timeFilter === 'lastYear') {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear(), 0, 1);
    createdAt = { $gte: start, $lt: end };
  }

  return createdAt;
};

// Get all products with filters and statistics
const getAllProducts = async (req, res) => {
  try {
    console.log('🔍 PRODUCT REPORT - Fetching products AND services from database');
    
    const { 
      status = 'all', 
      timeFilter = 'all', 
      search = '',
      page = 1,
      limit = 10
    } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const createdAtFilter = buildDateRangeFilter(timeFilter);

    // Build filter conditions for products
    let productFilter = {};
    
    // Search filter
    if (search) {
      productFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (createdAtFilter) {
      productFilter.createdAt = createdAtFilter;
    }
    if (status === 'active') {
      productFilter.stock = { $gt: 0 };
    } else if (status === 'pending') {
      productFilter.stock = 0;
    } else if (status === 'rejected') {
      productFilter._id = null; // No rejected state in current product schema
    }

    // Build filter conditions for services (similar to products)
    let serviceFilter = {};
    
    if (search) {
      serviceFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (createdAtFilter) {
      serviceFilter.createdAt = createdAtFilter;
    }
    if (status === 'pending' || status === 'rejected') {
      serviceFilter._id = null;
    }

    // Get products and services
    const products = await Product.find(productFilter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    const services = await Service.find(serviceFilter)
      .sort({ createdAt: -1 });

    // Combine products and services
    const allItems = [
      ...products.map(product => ({
        ...product.toObject(),
        type: 'product'
      })),
      ...services.map(service => ({
        ...service.toObject(),
        type: 'service'
      }))
    ];

    // Sort combined items by creation date
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedItems = allItems.slice(startIndex, endIndex);

    const total = allItems.length;

    console.log('🔍 PRODUCT REPORT - Found products:', products.length);
    console.log('🔍 PRODUCT REPORT - Found services:', services.length);
    console.log('🔍 PRODUCT REPORT - Total items:', total);

    // Calculate combined statistics
    const productStats = await Product.aggregate([
      { $match: productFilter },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const serviceStats = await Service.aggregate([
      { $match: serviceFilter },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get order statistics for product sales
    const orderStats = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.totalPrice'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          productId: '$_id',
          productName: '$productInfo.name',
          unitPrice: '$productInfo.price',
          totalSold: '$totalSold',
          totalRevenue: '$totalRevenue',
          currentStock: '$productInfo.stock'
        }
      }
    ]);

    // Format combined data with sales information
    const formattedItems = paginatedItems.map(item => {
      const salesInfo = item.type === 'product' ? 
        orderStats.find(stat => stat.productId.toString() === item._id.toString()) : null;
      
      return {
        id: item._id,
        productName: item.name,
        unitPrice: item.price || 0,
        totalSold: salesInfo?.totalSold || 0,
        stockAmount: item.stock || 0,
        rating: 0, // Can be added to schema later
        totalAmountSold: salesInfo?.totalRevenue || 0,
        averageProductValue: salesInfo?.totalSold > 0 ? (salesInfo.totalRevenue / salesInfo.totalSold) : 0,
        type: item.type, // Add type to distinguish product vs service
        category: item.category?.name || item.serviceType || 'N/A'
      };
    });

    // Calculate KPI data for both products and services
    const kpiData = {
      totalProducts: {
        active: await Product.countDocuments({ stock: { $gt: 0 } }) + await Service.countDocuments({}),
        pending: await Product.countDocuments({ stock: 0 }),
        rejected: 0, // No inactive status in our schema
        total: await Product.countDocuments({}) + await Service.countDocuments({})
      },
      totalProductSale: orderStats.reduce((sum, item) => sum + item.totalSold, 0),
      totalDiscountGiven: await Order.aggregate([
        { $match: { 'pricing.discount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$pricing.discount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json({
      products: formattedItems,
      kpiData,
      productStats: productStats.map(stat => ({
        month: new Date(2024, stat._id - 1).toLocaleString('default', { month: 'short' }),
        count: stat.count
      })),
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product stock information
const getProductStock = async (req, res) => {
  try {
    console.log('🔍 PRODUCT STOCK - Fetching products AND services stock data');
    
    const { 
      type = 'all', 
      category = 'all', 
      sortBy = 'ASC'
    } = req.query;

    // Get all products and services
    const products = await Product.find({})
      .select('name stock updatedAt')
      .sort({ createdAt: -1 });

    const services = await Service.find({})
      .select('name updatedAt')
      .sort({ createdAt: -1 });

    // Combine products and services
    const allItems = [
      ...products.map(product => ({
        ...product.toObject(),
        type: 'product',
        stock: product.stock || 0
      })),
      ...services.map(service => ({
        ...service.toObject(),
        type: 'service',
        stock: 0 // Services don't have stock
      }))
    ];

    // Sort by stock level
    let combinedItems = allItems;
    if (type === 'product' || type === 'service') {
      combinedItems = allItems.filter((item) => item.type === type);
    }

    const sortedItems = sortBy === 'ASC'
      ? combinedItems.sort((a, b) => a.stock - b.stock)
      : combinedItems.sort((a, b) => b.stock - a.stock);

    console.log('🔍 PRODUCT STOCK - Found products:', products.length);
    console.log('🔍 PRODUCT STOCK - Found services:', services.length);
    console.log('🔍 PRODUCT STOCK - Total items:', sortedItems.length);

    // Format stock data
    const stockData = sortedItems.map((item, index) => ({
      id: index + 1,
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      stock: item.stock,
      lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
      type: item.type,
      status: item.type === 'service' ? 'Active' : (item.stock > 0 ? 'In Stock' : 'Out of Stock')
    }));

    res.json({
      products: stockData,
      total: stockData.length
    });
  } catch (error) {
    console.error('🔍 PRODUCT STOCK - Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export product data
const exportProducts = async (req, res) => {
  try {
    const { status = 'all', timeFilter = 'all', search = '' } = req.query;
    const createdAtFilter = buildDateRangeFilter(timeFilter);

    let productFilter = {};
    let serviceFilter = {};

    if (search) {
      productFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      serviceFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (createdAtFilter) {
      productFilter.createdAt = createdAtFilter;
      serviceFilter.createdAt = createdAtFilter;
    }

    if (status === 'active') {
      productFilter.stock = { $gt: 0 };
    } else if (status === 'pending') {
      productFilter.stock = 0;
      serviceFilter._id = null;
    } else if (status === 'rejected') {
      productFilter._id = null;
      serviceFilter._id = null;
    }

    const [products, services] = await Promise.all([
      Product.find(productFilter).select('name price stock createdAt'),
      Service.find(serviceFilter).select('name price createdAt')
    ]);

    const csvRows = [
      ['Type', 'Name', 'Unit Price', 'Stock', 'Created At'],
      ...products.map((p) => ['product', p.name, p.price || 0, p.stock || 0, p.createdAt ? new Date(p.createdAt).toISOString() : '']),
      ...services.map((s) => ['service', s.name, s.price || 0, 0, s.createdAt ? new Date(s.createdAt).toISOString() : ''])
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-services-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get wish listed products with statistics
const getWishlistProducts = async (req, res) => {
  try {
    console.log('🔍 WISHLIST - Fetching wish listed products and services');
    
    const { 
      search = '',
      page = 1,
      limit = 10
    } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Build search filter
    let matchStage = {};
    if (search) {
      matchStage = {
        $or: [
          { 'product.name': { $regex: search, $options: 'i' } },
          { 'product.description': { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Support both wishlist schemas:
    // 1) Embedded: { customer, items: [{ product, addedAt }] }
    // 2) Flat: { user, product, addedAt }
    const productWishlistStats = await Wishlist.aggregate([
      {
        $project: {
          normalizedItems: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$items', []] } }, 0] },
              '$items',
              [
                {
                  product: '$product',
                  addedAt: { $ifNull: ['$addedAt', '$createdAt'] }
                }
              ]
            ]
          }
        }
      },
      { $unwind: '$normalizedItems' },
      { $match: { 'normalizedItems.product': { $ne: null } } },
      {
        $group: {
          _id: '$normalizedItems.product',
          totalWishlistCount: { $sum: 1 },
          firstAdded: { $min: '$normalizedItems.addedAt' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: matchStage },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          date: '$firstAdded',
          totalInWishlist: '$totalWishlistCount',
          type: 'product'
        }
      }
    ]);

    // Wishlisted tab should only include products actually present in wishlists
    const allWishlistStats = [...productWishlistStats]
      .sort((a, b) => {
        if (b.totalInWishlist !== a.totalInWishlist) return b.totalInWishlist - a.totalInWishlist;
        return new Date(b.date) - new Date(a.date);
      });

    console.log('🔍 WISHLIST - Found products in wishlist:', productWishlistStats.length);
    console.log('🔍 WISHLIST - Total items:', allWishlistStats.length);

    // Get total count for pagination
    const total = allWishlistStats.length;

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = allWishlistStats.slice(startIndex, startIndex + limitNum);

    // Format results for frontend
    const formattedResults = paginatedResults.map((item, index) => ({
      id: index + 1,
      productName: item.productName.length > 25 ? item.productName.substring(0, 25) + '...' : item.productName,
      date: new Date(item.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      totalInWishlist: item.totalInWishlist,
      type: item.type
    }));

    res.json({
      products: formattedResults,
      total,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('🔍 WISHLIST - Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductStock,
  getWishlistProducts,
  exportProducts
};

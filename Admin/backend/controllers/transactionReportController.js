const Order = require('../models/Order');
const VendorProduct = require('../models/VendorProduct');

const getStartDateFromRange = (range = 'thisMonth') => {
  const now = new Date();
  switch (range) {
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

const getOrderAmount = (order) => Number(order?.totalAmount || order?.pricing?.total || 0);
const getOrderTax = (order) => Number(order?.taxAmount || order?.tax || order?.pricing?.tax || 0);
const getOrderShipping = (order) => Number(order?.shippingCharge || order?.shipping || order?.pricing?.shipping || 0);
const getOrderDiscount = (order) => Number(order?.discount || order?.pricing?.discount || 0);

const mapPaymentMethod = (paymentMethod) => {
  const key = String(paymentMethod || '').trim().toLowerCase();
  switch (key) {
    case 'cod':
    case 'cash':
    case 'cash_on_delivery':
    case 'cash-on-delivery':
      return { name: 'Cash', color: '#4CAF50' };
    case 'upi':
    case 'razorpay':
    case 'online':
    case 'online_payment':
    case 'card':
    case 'credit_card':
    case 'debit_card':
      return { name: 'Digital', color: '#2196F3' };
    case 'wallet':
    case 'online_wallet':
      return { name: 'Wallet', color: '#9C27B0' };
    case 'bank_transfer':
    case 'offline':
      return { name: 'Offline', color: '#FF9800' };
    default:
      return key ? { name: 'Other', color: '#757575' } : { name: 'Unknown', color: '#9E9E9E' };
  }
};

const normalizeStatusFilter = (status) => {
  switch (status) {
    case 'completed':
      return { status: 'delivered' };
    case 'ongoing':
      return { status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } };
    case 'cancelled':
      return { status: { $in: ['cancelled', 'refunded'] } };
    default:
      return {};
  }
};

const getOrderTransactions = async (req, res) => {
  try {
    const {
      status = 'all',
      customer = 'all',
      vendor = 'all',
      dateRange = 'thisMonth',
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filter = {
      ...normalizeStatusFilter(status)
    };

    const startDate = getStartDateFromRange(dateRange);
    if (startDate) {
      filter.createdAt = { $gte: startDate };
    }

    if (customer !== 'all') {
      filter.customer = customer;
    }

    let vendorProductIds = [];
    if (vendor !== 'all') {
      vendorProductIds = await VendorProduct.find({ vendorId: vendor }, '_id').lean().then((rows) => rows.map((r) => r._id));
      if (!vendorProductIds.length) {
        return res.json({
          orders: [],
          summary: {
            totalOrders: 0,
            inhouseOrders: 0,
            vendorOrders: 0,
            totalProducts: 0,
            inhouseProducts: 0,
            vendorProducts: 0,
            totalStores: 0
          },
          orderStats: [],
          paymentStats: [],
          pagination: { current: pageNum, pages: 0, total: 0 }
        });
      }
      filter['items.product'] = { $in: vendorProductIds };
    }

    if (search?.trim()) {
      filter.orderNumber = { $regex: search.trim(), $options: 'i' };
    }

    const allMatchedOrders = await Order.find(filter).populate('customer', 'name firstName lastName email').lean();

    const total = allMatchedOrders.length;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedOrders = allMatchedOrders.slice(startIndex, startIndex + limitNum);

    const allVendorProducts = await VendorProduct.find({}, '_id vendorId').lean();
    const vendorProductIdSet = new Set(allVendorProducts.map((vp) => vp._id.toString()));
    const vendorIdSet = new Set();

    let inhouseOrders = 0;
    let vendorOrders = 0;
    let inhouseProducts = 0;
    let vendorProductsCount = 0;

    for (const order of allMatchedOrders) {
      let hasVendorItem = false;
      let hasInhouseItem = false;
      for (const item of order.items || []) {
        const productId = item?.product?.toString();
        const isVendorItem = item?.productModel === 'VendorProduct' || (productId && vendorProductIdSet.has(productId));
        if (isVendorItem) {
          hasVendorItem = true;
          vendorProductsCount += 1;
          const vp = allVendorProducts.find((row) => row._id.toString() === productId);
          if (vp?.vendorId) vendorIdSet.add(vp.vendorId.toString());
        } else {
          hasInhouseItem = true;
          inhouseProducts += 1;
        }
      }
      if (hasVendorItem) vendorOrders += 1;
      if (hasInhouseItem) inhouseOrders += 1;
    }

    const summary = {
      totalOrders: total,
      inhouseOrders,
      vendorOrders,
      totalProducts: inhouseProducts + vendorProductsCount,
      inhouseProducts,
      vendorProducts: vendorProductsCount,
      totalStores: (inhouseProducts > 0 ? 1 : 0) + vendorIdSet.size
    };

    const orderStatsAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: { $month: '$createdAt' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const paymentStatsAgg = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: { $ifNull: ['$totalAmount', 0] } }
        }
      }
    ]);

    const totalPaymentCount = paymentStatsAgg.reduce((sum, row) => sum + row.count, 0);
    const paymentStats = paymentStatsAgg.map((row) => {
      const mapped = mapPaymentMethod(row._id);
      return {
        name: mapped.name,
        value: totalPaymentCount > 0 ? Math.round((row.count / totalPaymentCount) * 100) : 0,
        amount: Number(row.amount || 0),
        color: mapped.color
      };
    });

    const formattedOrders = pagedOrders.map((order) => {
      const totalAmount = getOrderAmount(order);
      const vatTax = getOrderTax(order);
      const shippingCharge = getOrderShipping(order);
      const productDiscount = getOrderDiscount(order);
      const totalProductAmount = (order.items || []).reduce((sum, item) => sum + getItemAmount(item), 0) || totalAmount;
      const discountedAmount = Math.max(0, totalProductAmount - productDiscount);
      const customerName =
        order.customer?.name ||
        [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') ||
        order.customer?.email ||
        'Guest User';

      return {
        id: order._id,
        orderId: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        shopName: 'Main Store',
        customerName,
        totalProductAmount,
        productDiscount,
        couponDiscount: 0,
        discountedAmount,
        vatTax,
        shippingCharge,
        orderAmount: totalAmount,
        deliveredBy: order.status === 'delivered' ? 'Delivery Man' : 'Admin'
      };
    });

    const orderStats = orderStatsAgg.map((stat) => ({
      month: new Date(2024, stat._id - 1).toLocaleString('default', { month: 'short' }),
      orders: stat.orders
    }));

    res.json({
      orders: formattedOrders,
      summary,
      orderStats,
      paymentStats,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching order transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

const getExpenseTransactions = async (req, res) => {
  try {
    const { year = 'thisYear' } = req.query;
    const startDate = getStartDateFromRange(year);
    const filter = {};
    if (startDate) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter).lean();
    const totalCouponDiscount = orders.reduce((sum, order) => sum + getOrderDiscount(order), 0);
    const totalFreeDelivery = orders.reduce((sum, order) => sum + (getOrderShipping(order) === 0 ? 0 : 0), 0);
    const totalExpense = totalCouponDiscount + totalFreeDelivery;

    const expenseStatsAgg = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $month: '$createdAt' },
          expense: { $sum: { $ifNull: ['$discount', { $ifNull: ['$pricing.discount', 0] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      expenses: [],
      summary: {
        totalExpense,
        freeDelivery: totalFreeDelivery,
        couponDiscount: totalCouponDiscount
      },
      expenseStats: expenseStatsAgg.map((stat) => ({
        month: new Date(2024, stat._id - 1).toLocaleString('default', { month: 'short' }),
        expense: Number(stat.expense || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

const getRefundTransactions = async (req, res) => {
  try {
    const {
      date = 'all',
      category = 'all',
      subCategory = 'all',
      brand = 'all',
      search = '',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filter = { status: 'refunded' };
    const startDate = getStartDateFromRange(date);
    if (startDate) filter.updatedAt = { $gte: startDate };

    const orders = await Order.find(filter)
      .populate('customer', 'name firstName lastName email')
      .populate('items.product', 'name category brand')
      .sort({ updatedAt: -1 })
      .lean();

    let rows = [];
    for (const order of orders) {
      const customerName =
        order.customer?.name ||
        [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') ||
        order.customer?.email ||
        'Guest User';

      for (const item of order.items || []) {
        const product = item.product || {};
        const productName = item.productName || product.name || 'Unknown Product';
        const itemCategory = String(product.category || item.category || '').toLowerCase();
        const itemSubCategory = String(item.subCategory || '').toLowerCase();
        const itemBrand = String(product.brand || item.brand || '').toLowerCase();

        if (category !== 'all' && itemCategory !== String(category).toLowerCase()) continue;
        if (subCategory !== 'all' && itemSubCategory !== String(subCategory).toLowerCase()) continue;
        if (brand !== 'all' && itemBrand !== String(brand).toLowerCase()) continue;
        if (search && !productName.toLowerCase().includes(String(search).toLowerCase()) && !String(order.orderNumber || '').toLowerCase().includes(String(search).toLowerCase())) continue;

        rows.push({
          id: `${order._id}-${item._id || productName}`,
          productName,
          variant: `Qty: ${Number(item.quantity || 0)}`,
          refundId: `REF-${order._id.toString().slice(-6).toUpperCase()}`,
          orderId: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
          shopName: 'Main Store',
          paymentMethod: mapPaymentMethod(order.paymentMethod).name,
          paidBy: customerName,
          amount: getItemAmount(item),
          transactionType: 'Refund'
        });
      }
    }

    const total = rows.length;
    rows = rows.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({
      refunds: rows,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching refund transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

const downloadPdf = async (req, res) => {
  res.status(501).json({ message: 'PDF download not implemented yet' });
};

const exportExcel = async (req, res) => {
  res.status(501).json({ message: 'Excel export not implemented yet' });
};

module.exports = {
  getOrderTransactions,
  getExpenseTransactions,
  getRefundTransactions,
  downloadPdf,
  exportExcel
};

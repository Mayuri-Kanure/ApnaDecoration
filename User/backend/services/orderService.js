const { Order, Product, Service, User, VendorProduct } = require('../models');

// Constants directly defined
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

const ORDER_TYPE = {
  PRODUCT: 'product',
  SERVICE: 'service'
};

const PRODUCT_STATUS = {
  ACTIVE: 'active',
  OUT_OF_STOCK: 'out_of_stock'
};

class OrderService {
  // Create new order
  static async createOrder(orderData, userId) {
    console.log('🔍 OrderService.createOrder called with:', { orderData, userId });
    
    const { items, shippingAddress, paymentMethod } = orderData;

    // Validate order data
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (!shippingAddress) {
      throw new Error('Shipping address is required');
    }

    console.log('🔍 Order validation passed');

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.product || item.productId; // Accept both formats
      let product = await Product.findById(productId);
      
      // If not found in Product, try VendorProduct (same logic as cart)
      if (!product) {
        console.log('📦 Product not found in Product model, trying VendorProduct for:', productId);
        product = await VendorProduct.findById(productId);
        if (product) {
          console.log('📦 Found vendor product for order:', product.name);
        }
      }
      
      if (!product) {
        console.log('⚠️ Product not found, but continuing with order:', productId);
        // Create a dummy product entry to avoid breaking the order
        const dummyProduct = {
          _id: productId,
          name: 'Product ' + productId,
          price: item.unitPrice || 0
        };
        
        totalAmount += item.totalPrice || 0;

        orderItems.push({
          product: productId,
          productModel: 'Product',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0
        });
        continue;
      }

      console.log('📦 Found product for order:', product.name);

      // ✅ CORRECT: Use frontend values, don't recalculate
      const itemTotal = item.totalPrice;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        productModel: product.constructor.modelName === 'VendorProduct' ? 'VendorProduct' : 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });

      console.log('📦 Added item to order:', {
        name: product.name,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      });
    }

    console.log('� Creating order with items:', orderItems.length);
    console.log('🔍 Total amount:', totalAmount);

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      
      // ✅ EXPLICIT PRICING OBJECT (FIXED)
      pricing: {
        subtotal: orderData.pricing?.subtotal || totalAmount,
        tax: orderData.pricing?.tax || 0,
        shipping: orderData.pricing?.shipping || 0,
        total: orderData.pricing?.total || totalAmount
      },
      
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: orderData.paymentStatus || 'pending',
      eventInfo: orderData.eventInfo || null,
      referenceImage: orderData.referenceImage || null,
      status: ORDER_STATUS.PENDING,
      orderNumber: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
    });

    console.log('🔍 Saving order...');
    await order.save();
    console.log('✅ Order saved successfully:', order._id);

    return order;
  }

  // Create service booking
  static async createServiceBooking(bookingData, userId) {
    const { serviceId, bookingDate, bookingTime, notes, customerInfo, referenceImage } = bookingData;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    if (service.status !== 'active') {
      throw new Error('Service is not available for booking');
    }

    // Create booking order
    console.log('🔍 Creating booking object...');
    const booking = new Order({
      user: userId,
      type: ORDER_TYPE.SERVICE,
      service: service._id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      serviceImage: service.image,
      bookingDate,
      bookingTime,
      notes,
      customerInfo,
      referenceImage,
      pricing: {
        subtotal: service.price,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: service.price
      },
      status: ORDER_STATUS.PENDING,
      orderNumber: OrderService.generateOrderNumber('SVC')
    });

    console.log('🔍 Booking object created:', {
      orderNumber: booking.orderNumber,
      type: booking.type,
      service: booking.service,
      serviceName: booking.serviceName,
      pricing: booking.pricing,
      status: booking.status
    });

    console.log('🔍 Attempting to save booking...');
    await booking.save();
    console.log('✅ Booking saved successfully!');

    return booking;
  }

  // Get user's orders
  static async getUserOrders(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    // Build query
    console.log('🔍 getOrders called with:', { userId, page, limit, status, sortBy, sortOrder });
    
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 Query:', query);
    console.log('🔍 Sort:', sort);

    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Math.min(limit, 100));

    // Manually populate products based on productModel
    console.log('🔍 Starting manual population for', orders.length, 'orders');
    for (let order of orders) {
      console.log('🔍 Processing order with', order.items.length, 'items');
      for (let item of order.items) {
        console.log('🔍 Processing item:', item._id, 'product:', item.product, 'productModel:', item.productModel);
        // Check if product reference exists (could be ObjectId or string)
        if (item.product && item.productModel) {
          try {
            let productDoc = null;
            const productId = item.product.toString(); // Convert ObjectId to string
            
            if (item.productModel === 'Product') {
              productDoc = await Product.findById(productId).select('name images price thumbnail');
            } else if (item.productModel === 'VendorProduct') {
              productDoc = await VendorProduct.findById(productId).select('name images price thumbnail');
            }
            
            if (productDoc) {
              item.product = productDoc;
              console.log('✅ Product found and populated');
            } else {
              console.log('⚠️ Product not found for item:', item._id, 'model:', item.productModel, 'id:', productId);
              // Create a fallback product object
              item.product = {
                name: 'Product Not Available',
                images: [],
                thumbnail: null,
                price: item.unitPrice || 0
              };
            }
          } catch (error) {
            console.log('⚠️ Error populating product:', error.message);
            item.product = {
              name: 'Product Error',
              images: [],
              thumbnail: null,
              price: item.unitPrice || 0
            };
          }
        } else {
          console.log('⚠️ Item missing product or productModel');
        }
      }
    }

    console.log('🔍 Raw orders from DB:', orders.length, 'orders');
    if (orders.length > 0) {
      console.log('🔍 First order items:', orders[0].items.length, 'items');
      if (orders[0].items.length > 0) {
        console.log('🔍 First item full data:', JSON.stringify(orders[0].items[0], null, 2));
        console.log('🔍 First item product data:', orders[0].items[0].product);
        console.log('🔍 First item productModel:', orders[0].items[0].productModel);
      }
    }

    console.log('🔍 After population - First item product:', orders[0]?.items[0]?.product);

    // Post-process orders to ensure product data is available
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Process each item to ensure product data
      orderObj.items = orderObj.items.map(item => {
        // If product is null or missing, try to fetch it
        if (!item.product && item.productModel === 'Product') {
          // This is a fallback - you might need to store product info in the item itself
          console.log('⚠️ Missing product reference for item:', item._id);
        }
        
        return item;
      });
      
      return orderObj;
    });

    const total = await Order.countDocuments(query);

    return {
      orders: processedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get order by ID
  static async getOrderById(orderId, userId) {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new Error('Invalid order ID');
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price');

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user owns the order
    if (order.user._id.toString() !== userId) {
      throw new Error('Access denied');
    }

    return order;
  }

  // Update order status
  static async updateOrderStatus(orderId, status, notes = '') {
    if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new Error('Invalid order ID');
    }

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new Error('Invalid order status');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Add status change to timeline
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date(),
      notes,
      updatedBy: 'admin' // In real app, this would be the admin user ID
    });

    order.status = status;
    
    // If order is delivered, set actual delivery date
    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();
    
    // TODO: Send notification to user about status change
    
    return order;
  }

  // Cancel order
  static async cancelOrder(orderId, userId, reason = '') {
    const order = await this.getOrderById(orderId, userId);

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore stock
    for (const item of order.items) {
      const productId = item.product._id || item.product;
      await this.updateProductStock(productId, item.quantity);
    }

    return await this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, userId);
  }

  // Process refund
  static async processRefund(orderId, userId, refundAmount, reason = '') {
    const order = await this.getOrderById(orderId, userId);

    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw new Error('Refund can only be processed for delivered orders');
    }

    if (refundAmount > order.totalAmount) {
      throw new Error('Refund amount cannot exceed order total');
    }

    order.refundAmount = refundAmount;
    order.refundReason = reason;
    order.status = ORDER_STATUS.REFUNDED;

    return await order.save();
  }

  // Get order statistics
  static async getOrderStats(userId, filters = {}) {
    const { startDate, endDate } = filters;

    const matchStage = { user: userId };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    return stats;
  }

  // Generate unique order number
  static generateOrderNumber(prefix = 'ORD') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Update product stock (helper method)
  static async updateProductStock(productId, quantity) {
    let product = await Product.findById(productId);
    
    // If not found in Product, try VendorProduct
    if (!product) {
      console.log('📦 Product not found in Product model for stock update, trying VendorProduct:', productId);
      product = await VendorProduct.findById(productId);
      if (product) {
        console.log('📦 Found vendor product for stock update:', product.name);
      }
    }
    
    if (!product) return;

    product.stock = Math.max(0, product.stock + quantity);
    
    // Update status based on stock (only for Product model)
    if (product.status !== undefined) {
      if (product.stock === 0) {
        product.status = PRODUCT_STATUS.OUT_OF_STOCK;
      } else if (product.status === PRODUCT_STATUS.OUT_OF_STOCK) {
        product.status = PRODUCT_STATUS.ACTIVE;
      }
    }

    await product.save();
  }

  // Track order
  static async trackOrder(orderNumber) {
    const order = await Order.findOne({ orderNumber })
      .populate('items.product', 'name')
      .select('orderNumber status createdAt items statusHistory');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }
}

module.exports = OrderService;

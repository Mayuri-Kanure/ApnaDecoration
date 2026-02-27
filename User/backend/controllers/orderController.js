const { OrderService } = require('../services');
const emailService = require('../services/emailService');



// Get user's orders

const getOrders = async (req, res) => {
  try {
    // Get the actual user ID from authentication middleware
    const userId = req.user ? req.user.userId : null;
    
    console.log('🔍 getOrders called with user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const result = await OrderService.getUserOrders(userId, req.query);

    console.log('🔍 Orders found for user:', userId, 'Count:', result.orders?.length);

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('❌ Error in getOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};



// Get order by ID

const getOrderById = async (req, res) => {

  try {

    const { id } = req.params;

    const userId = req.user.userId;

    const order = await OrderService.getOrderById(id, userId);

    

    res.json({

      success: true,

      data: order

    });

  } catch (error) {

    res.status(404).json({

      success: false,

      message: error.message

    });

  }

};



// Create service booking

const createServiceBooking = async (req, res) => {

  try {

    const userId = req.user ? req.user.userId : '69523c2a9baedf46651d6bf6'; // Default admin user for testing

    

    console.log('🔍 Booking request received:', {

      body: req.body,

      file: req.file ? req.file.filename : 'No file',

      userId,

      headers: req.headers

    });

    

    // Parse booking data from FormData

    const bookingData = {

      serviceId: req.body.serviceId,

      bookingDate: req.body.bookingDate,

      bookingTime: req.body.bookingTime,

      notes: req.body.notes,

      customerInfo: req.body.customerInfo ? JSON.parse(req.body.customerInfo) : {},

      referenceImage: req.file ? `/uploads/orders/${req.file.filename}` : null

    };

    

    console.log('🔍 Parsed booking data:', bookingData);

    

    // Validate required fields

    if (!bookingData.serviceId) {

      console.log('❌ Missing serviceId');

      return res.status(400).json({

        success: false,

        message: 'Service ID is required',

        error: 'serviceId is missing'

      });

    }

    

    if (!bookingData.bookingDate) {

      console.log('❌ Missing bookingDate');

      return res.status(400).json({

        success: false,

        message: 'Booking date is required',

        error: 'bookingDate is missing'

      });

    }

    

    if (!bookingData.bookingTime) {

      console.log('❌ Missing bookingTime');

      return res.status(400).json({

        success: false,

        message: 'Booking time is required',

        error: 'bookingTime is missing'

      });

    }

    

    console.log('✅ Validation passed, calling OrderService.createServiceBooking...');

    const booking = await OrderService.createServiceBooking(bookingData, userId);

    

    res.status(201).json({

      success: true,

      message: 'Service booking created successfully',

      data: booking

    });

  } catch (error) {

    console.error('❌ Booking error:', error.message);

    console.error('❌ Full error:', error);

    res.status(400).json({

      success: false,

      message: 'Failed to create service booking',

      error: error.message

    });

  }

};



// Create new order

const createOrder = async (req, res) => {

  console.log('📦 ORDER BODY:', JSON.stringify(req.body, null, 2));

  console.log('👤 USER:', req.user);

  console.log('🔍 HEADERS:', JSON.stringify(req.headers, null, 2));

  

  try {

    // Handle authentication being temporarily disabled

    const userId = req.user ? req.user.userId : '69523c2a9baedf46651d6bf6'; // Default admin user for testing

    const orderData = req.body;

    

    console.log('🔍 Creating order for userId:', userId);

    console.log('📦 Order items:', JSON.stringify(orderData.items, null, 2));

    

    // Validate required fields

    if (!orderData.items || !Array.isArray(orderData.items)) {

      console.log('❌ Missing or invalid items array');

      return res.status(400).json({

        success: false,

        message: 'Failed to create order',

        error: 'Items array is required'

      });

    }

    

    // Validate each item

    for (let i = 0; i < orderData.items.length; i++) {

      const item = orderData.items[i];

      console.log(`🔍 Validating item ${i}:`, item);

      

      const productId = item.product || item.productId; // Accept both formats

      if (!productId) {

        console.log(`❌ Item ${i} missing product/productId`);

        return res.status(400).json({

          success: false,

          message: 'Failed to create order',

          error: `Item ${i} missing product/productId`

        });

      }

      

      if (!item.quantity || item.quantity < 1) {

        console.log(`❌ Item ${i} invalid quantity:`, item.quantity);

        return res.status(400).json({

          success: false,

          message: 'Failed to create order',

          error: `Item ${i} invalid quantity`

        });

      }

    }

    

    console.log('✅ All items validated successfully');

    

    // Handle reference image if uploaded

    if (req.file) {

      orderData.referenceImage = `/uploads/orders/${req.file.filename}`;

      console.log('📎 Reference image uploaded:', req.file.filename);

    }

    

    console.log('🔍 About to call OrderService.createOrder...');
    console.log('🔍 OrderService type:', typeof OrderService);
    console.log('🔍 OrderService.createOrder type:', typeof OrderService.createOrder);
    console.log('🔍 OrderService.createOrder exists:', !!OrderService.createOrder);
    
    try {
      const order = await OrderService.createOrder(orderData, userId);
      console.log('✅ Order created successfully:', order._id);
      
      // Send order confirmation email (async, don't wait)
      if (order.customerEmail || order.userId?.email) {
        const customerEmail = order.customerEmail || order.userId?.email;
        emailService.sendOrderConfirmation(order, customerEmail)
          .catch(emailError => {
            console.error('❌ Failed to send order confirmation email:', emailError);
          });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (serviceError) {
      console.log('❌ OrderService.createOrder ERROR:', serviceError.message);
      console.log('❌ OrderService.createOrder STACK:', serviceError.stack);
      throw serviceError;
    }

  } catch (error) {

    console.log('❌ ORDER CREATION ERROR:', error.message);

    console.log('❌ ERROR STACK:', error.stack);

    return res.status(400).json({

      success: false,

      message: 'Failed to create order',

      error: error.message

    });

  }

};



// Cancel order

const cancelOrder = async (req, res) => {

  try {

    const { id } = req.params;

    console.log('📦 ORDER BODY RECEIVED:', JSON.stringify(req.body, null, 2));

    

    const { items, shippingAddress, paymentMethod, pricing, eventInfo, paymentStatus } = req.body;

    const userId = req.user.userId;

    const { reason } = req.body;

    

    console.log('🔍 CANCEL ORDER REQUEST:', {

      id,

      userId,

      reason,

      items,

      shippingAddress,

      paymentMethod,

      pricing,

      eventInfo,

      paymentStatus

    });

    

    const order = await OrderService.cancelOrder(id, userId, reason);

    

    res.json({

      success: true,

      message: 'Order cancelled successfully',

      data: order

    });

  } catch (error) {

    res.status(400).json({

      success: false,

      message: 'Failed to cancel order',

      error: error.message

    });

  }

};



// Update order status

const updateOrderStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status, notes } = req.body;

    

    // Validate status

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {

      return res.status(400).json({

        success: false,

        message: 'Invalid status',

        error: `Status must be one of: ${validStatuses.join(', ')}`

      });

    }

    

    const order = await OrderService.updateOrderStatus(id, status, notes);

    

    res.json({

      success: true,

      data: order

    });

  } catch (error) {

    res.status(404).json({

      success: false,

      message: error.message

    });

  }

};



// Track order (public)

const trackOrder = async (req, res) => {

  try {

    const { orderNumber } = req.params;

    

    const order = await OrderService.trackOrder(orderNumber);

    

    res.json({

      success: true,

      data: order

    });

  } catch (error) {

    res.status(404).json({

      success: false,

      message: error.message

    });

  }

};



module.exports = {

  getOrders,

  getOrderById,

  createOrder,

  createServiceBooking,

  cancelOrder,

  updateOrderStatus,

  trackOrder

};


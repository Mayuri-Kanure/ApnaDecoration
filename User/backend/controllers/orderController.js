const { OrderService } = require("../services");
const emailService = require("../services/emailService");

// Get user's orders

const getOrders = async (req, res) => {
  try {
    // Get the actual user ID from authentication middleware
    const userId = req.user ? req.user.userId : null;

    console.log("🔍 getOrders called with user ID:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await OrderService.getUserOrders(userId, req.query);

    console.log(
      "🔍 Orders found for user:",
      userId,
      "Count:",
      result.orders?.length,
    );

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("❌ Error in getOrders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
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

      data: order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

// Create service booking

const createServiceBooking = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : "69523c2a9baedf46651d6bf6"; // Default admin user for testing

    console.log("🔍 Booking request received:", {
      body: req.body,

      file: req.file ? req.file.filename : "No file",

      userId,

      headers: req.headers,
    });

    // Parse booking data from FormData

    const bookingData = {
      serviceId: req.body.serviceId,

      bookingDate: req.body.bookingDate,

      bookingTime: req.body.bookingTime,

      notes: req.body.notes,

      customerInfo: req.body.customerInfo
        ? JSON.parse(req.body.customerInfo)
        : {},

      referenceImage: req.file ? `/uploads/orders/${req.file.filename}` : null,
    };

    console.log("🔍 Parsed booking data:", bookingData);

    // Validate required fields

    if (!bookingData.serviceId) {
      console.log("❌ Missing serviceId");

      return res.status(400).json({
        success: false,

        message: "Service ID is required",

        error: "serviceId is missing",
      });
    }

    if (!bookingData.bookingDate) {
      console.log("❌ Missing bookingDate");

      return res.status(400).json({
        success: false,

        message: "Booking date is required",

        error: "bookingDate is missing",
      });
    }

    if (!bookingData.bookingTime) {
      console.log("❌ Missing bookingTime");

      return res.status(400).json({
        success: false,

        message: "Booking time is required",

        error: "bookingTime is missing",
      });
    }

    console.log(
      "✅ Validation passed, calling OrderService.createServiceBooking...",
    );

    const booking = await OrderService.createServiceBooking(
      bookingData,
      userId,
    );

    res.status(201).json({
      success: true,

      message: "Service booking created successfully",

      data: booking,
    });
  } catch (error) {
    console.error("❌ Booking error:", error.message);

    console.error("❌ Full error:", error);

    res.status(400).json({
      success: false,

      message: "Failed to create service booking",

      error: error.message,
    });
  }
};

// Create new order

const createOrder = async (req, res) => {
  console.log("📦 ORDER BODY:", JSON.stringify(req.body, null, 2));

  console.log("👤 USER:", req.user);

  console.log("🔍 HEADERS:", JSON.stringify(req.headers, null, 2));

  try {
    // Handle authentication being temporarily disabled

    const userId = req.user ? req.user.userId : "69523c2a9baedf46651d6bf6"; // Default admin user for testing

    const orderData = req.body;

    console.log("🔍 Creating order for userId:", userId);

    console.log("📦 Order items:", JSON.stringify(orderData.items, null, 2));

    // Validate required fields

    if (!orderData.items || !Array.isArray(orderData.items)) {
      console.log("❌ Missing or invalid items array");

      return res.status(400).json({
        success: false,

        message: "Failed to create order",

        error: "Items array is required",
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

          message: "Failed to create order",

          error: `Item ${i} missing product/productId`,
        });
      }

      if (!item.quantity || item.quantity < 1) {
        console.log(`❌ Item ${i} invalid quantity:`, item.quantity);

        return res.status(400).json({
          success: false,

          message: "Failed to create order",

          error: `Item ${i} invalid quantity`,
        });
      }
    }

    console.log("✅ All items validated successfully");

    // Handle reference image if uploaded

    if (req.file) {
      orderData.referenceImage = `/uploads/orders/${req.file.filename}`;

      console.log("📎 Reference image uploaded:", req.file.filename);
    }

    console.log("🔍 About to call OrderService.createOrder...");
    console.log("🔍 OrderService type:", typeof OrderService);
    console.log(
      "🔍 OrderService.createOrder type:",
      typeof OrderService.createOrder,
    );
    console.log(
      "🔍 OrderService.createOrder exists:",
      !!OrderService.createOrder,
    );

    try {
      const order = await OrderService.createOrder(orderData, userId);
      console.log("✅ Order created successfully:", order._id);

      // Send order confirmation email (async, don't wait)
      if (order.customerEmail || order.userId?.email) {
        const customerEmail = order.customerEmail || order.userId?.email;
        emailService
          .sendOrderConfirmation(order, customerEmail)
          .catch((emailError) => {
            console.error(
              "❌ Failed to send order confirmation email:",
              emailError,
            );
          });
      }

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (serviceError) {
      console.log("❌ OrderService.createOrder ERROR:", serviceError.message);
      console.log("❌ OrderService.createOrder STACK:", serviceError.stack);
      throw serviceError;
    }
  } catch (error) {
    console.log("❌ ORDER CREATION ERROR:", error.message);

    console.log("❌ ERROR STACK:", error.stack);

    return res.status(400).json({
      success: false,

      message: error.message || "Failed to create order",

      error: error.message,
    });
  }
};

// Cancel order

const cancelOrder = async (req, res) => {
  console.log("🔍 CANCEL ORDER ENDPOINT HIT");

  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user._id?.toString();
    const { reason } = req.body;

    console.log("🔍 CANCEL ORDER REQUEST:", {
      id,
      userId,
      reason,
      userFromAuth: req.user,
      userIdType: typeof userId,
    });

    // Validate inputs
    if (!id) {
      console.log("❌ Missing order ID");
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
        error: "Missing order ID",
      });
    }

    if (!userId) {
      console.log("❌ Missing user ID");
      return res.status(401).json({
        success: false,
        message: "User authentication required",
        error: "Missing user ID",
      });
    }

    // DIRECT IMPLEMENTATION AS BACKUP - bypass service layer
    console.log("🔍 Using direct implementation as backup");
    const { Order } = require("../models");

    // Direct order lookup with null checks
    const order = await Order.findById(id);

    if (!order) {
      console.log("❌ Order not found:", id);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("🔍 Order found:", {
      orderId: order._id,
      orderUser: order.user,
      orderStatus: order.status,
    });

    // Check user ownership with null safety
    if (!order.user) {
      console.log("❌ Order has no user associated");
      return res.status(400).json({
        success: false,
        message: "Order is not associated with any user",
      });
    }

    const orderUserId = order.user.toString();
    if (orderUserId !== userId) {
      console.log("❌ User ownership check failed:", { orderUserId, userId });
      return res.status(403).json({
        success: false,
        message: "Unauthorized - you do not own this order",
      });
    }

    // Check order status
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Update order status
    order.status = "cancelled";
    order.timeline = order.timeline || [];
    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      notes: reason || "Customer requested cancellation",
      updatedBy: "customer",
    });

    await order.save();

    console.log("✅ Order cancelled successfully:", order._id);

    // 🔓 RELEASE STOCK BACK TO INVENTORY
    console.log("🔓 Releasing stock back to inventory...");
    const { Product, VendorProduct } = require("../models");

    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        try {
          const productId = item.product.toString();
          const quantity = item.quantity;

          console.log(
            `🔓 Releasing ${quantity} units for product ${productId}`,
          );

          // Try Product model first
          let product = await Product.findById(productId);
          let modelType = "Product";

          if (!product) {
            // Try VendorProduct model
            product = await VendorProduct.findById(productId);
            modelType = "VendorProduct";
          }

          if (product) {
            // Increment stock back
            const updateQuery = { $inc: { stock: quantity } };

            if (modelType === "Product") {
              await Product.findByIdAndUpdate(productId, updateQuery);
            } else {
              await VendorProduct.findByIdAndUpdate(productId, updateQuery);
            }

            console.log(
              `✅ Restored ${quantity} units for ${product.name} (Stock: ${product.stock} → ${product.stock + quantity})`,
            );
          } else {
            console.log(`⚠️ Product not found for stock release: ${productId}`);
          }
        } catch (stockError) {
          console.error(
            `❌ Error releasing stock for item ${item.product}:`,
            stockError.message,
          );
          // Don't fail the cancellation, just log the error
        }
      }

      console.log(`✅ Stock release completed for ${order.items.length} items`);
    }

    res.json({
      success: true,
      message: "Order cancelled successfully and stock restored",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error name:", error.name);

    // Send more detailed error information
    const errorResponse = {
      success: false,
      message: "Failed to cancel order",
      error: error.message,
      errorName: error.name,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };

    console.log("🔍 Sending error response:", errorResponse);
    res.status(400).json(errorResponse);
  }
};

// Update order status

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, notes } = req.body;

    // Validate status

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status",

        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await OrderService.updateOrderStatus(id, status, notes);

    res.json({
      success: true,

      data: order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,

      message: error.message,
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

      data: order,
    });
  } catch (error) {
    res.status(404).json({
      success: false,

      message: error.message,
    });
  }
};

// Admin methods
const getAdminOrders = async (req, res) => {
  try {
    console.log("ADMIN ORDERS REQUEST");
    console.log("Query parameters:", req.query);

    const Order = require("../models/Order");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.orderStatus || req.query.status;
    const search = req.query.search;

    console.log("Parsed parameters:", { page, limit, status, search });

    let query = {};

    // Handle status filtering
    if (status && status !== "all") {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
      console.log("Status filter applied:", query.status);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customerInfo.name": { $regex: search, $options: "i" } },
        { "customerInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    console.log("Executing query:", JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email");

    const total = await Order.countDocuments(query);

    console.log("Query results:");
    console.log("- Total orders found:", total);
    console.log("- Orders returned:", orders.length);
    console.log(
      "- First few orders:",
      orders.slice(0, 2).map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        user: o.user?.name,
      })),
    );

    // Calculate statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("Order statistics:", orderStats);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: orderStats,
      },
    });
  } catch (error) {
    console.error("❌ Admin orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    console.log("🔍 ADMIN ORDER STATS REQUEST");

    const Order = require("../models/Order");

    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "confirmed"] } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("❌ Order stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cancelled orders
const clearCancelledOrders = async (req, res) => {
  try {
    // Get user ID from authentication middleware
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("Clearing cancelled orders for user:", userId);

    const result = await OrderService.clearCancelledOrders(userId);

    res.json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing cancelled orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
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
  trackOrder,
  getAdminOrders,
  getOrderStats,
  clearCancelledOrders,
};

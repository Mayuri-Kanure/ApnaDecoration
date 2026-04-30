const mongoose = require("mongoose");
const DeliveryOrder = require("../models/DeliveryOrder");
const DeliveryBoy = require("../models/DeliveryBoy");
const { validationResult } = require("express-validator");

// @desc    Get available orders for delivery boy
// @route   GET /api/delivery-orders/available
// @access   Private
exports.getAvailableOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get available orders (pending and not assigned)
    const orders = await DeliveryOrder.find({
      status: "pending",
      $or: [{ deliveryBoyId: { $exists: false } }, { deliveryBoyId: null }],
    })
      .populate("customerId", "name email phone")
      .populate("vendorId", "shopName phone address")
      .sort({ priority: -1, orderDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await DeliveryOrder.countDocuments({
      status: "pending",
      $or: [{ deliveryBoyId: { $exists: false } }, { deliveryBoyId: null }],
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting available orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get delivery boy orders
// @route   GET /api/delivery-orders/my-orders
// @access   Private
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const deliveryBoyId = req.deliveryBoy?._id || req.user?._id;
    if (!deliveryBoyId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No delivery boy ID found",
      });
    }

    let query = { deliveryBoyId };

    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await DeliveryOrder.find(query)
      .populate("customerId", "name email phone")
      .populate("vendorId", "shopName phone address")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DeliveryOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting my orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Accept order
// @route   POST /api/delivery-orders/:orderId/accept
// @access   Private
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order is no longer available",
      });
    }

    if (order.deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: "Order already assigned to another delivery boy",
      });
    }

    // Assign order to delivery boy
    const deliveryBoyId = req.deliveryBoy?.id || req.user?.id;
    if (!deliveryBoyId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No delivery boy ID found",
      });
    }

    order.deliveryBoyId = deliveryBoyId;
    order.status = "accepted";
    order.acceptedDate = new Date();

    // Add tracking entry
    order.tracking.push({
      timestamp: new Date(),
      status: "accepted",
      note: "Order accepted by delivery boy",
    });

    await order.save();

    // Update delivery boy stats
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (deliveryBoy) {
      deliveryBoy.lastActive = new Date();
      await deliveryBoy.save();
    }

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Reject order
// @route   POST /api/delivery-orders/:orderId/reject
// @access   Private
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be rejected",
      });
    }

    // Update order status
    order.status = "rejected";

    // Add tracking entry
    order.tracking.push({
      timestamp: new Date(),
      status: "rejected",
      note: reason || "Order rejected by delivery boy",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Start delivery
// @route   POST /api/delivery-orders/:orderId/start
// @access   Private
exports.startDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliveryBoyId.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Order must be accepted first",
      });
    }

    // Update order status
    order.status = "picked_up";
    order.pickedUpDate = new Date();

    // Add tracking entry
    order.tracking.push({
      timestamp: new Date(),
      status: "picked_up",
      note: "Order picked up from vendor",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery started successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error starting delivery:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Complete delivery
// @route   POST /api/delivery-orders/:orderId/complete
// @access   Private
exports.completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { images, notes } = req.body;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliveryBoyId.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    if (order.status !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: "Order must be picked up first",
      });
    }

    // Update order status
    order.status = "delivered";
    order.deliveredDate = new Date();
    order.completedDate = new Date();

    // Add images if provided
    if (images && images.length > 0) {
      order.images.push(...images);
    }

    // Add notes if provided
    if (notes) {
      order.notes.push({
        note: notes,
        addedBy: req.deliveryBoy.id,
        noteModel: "DeliveryBoy",
      });
    }

    // Calculate earnings
    await order.calculateEarnings();

    // Add tracking entry
    order.tracking.push({
      timestamp: new Date(),
      status: "delivered",
      note: "Order delivered successfully",
    });

    await order.save();

    // Update delivery boy stats
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    if (deliveryBoy) {
      await deliveryBoy.updateStats(true);
      await deliveryBoy.updateEarnings(order.deliveryBoyEarnings);
    }

    res.status(200).json({
      success: true,
      message: "Delivery completed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error completing delivery:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get order details
// @route   GET /api/delivery-orders/:orderId
// @access   Private
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DeliveryOrder.findById(orderId)
      .populate("customerId", "name email phone")
      .populate("vendorId", "shopName phone address")
      .populate("deliveryBoyId", "firstName lastName phone email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if delivery boy is authorized to view this order
    if (
      order.deliveryBoyId &&
      order.deliveryBoyId._id.toString() !== req.deliveryBoy.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error getting order details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update order location
// @route   PUT /api/delivery-orders/:orderId/location
// @access   Private
exports.updateOrderLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude } = req.body;

    const order = await DeliveryOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.deliveryBoyId.toString() !== req.deliveryBoy.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Update delivery boy location
    order.deliveryBoyLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // Add tracking entry
    order.tracking.push({
      timestamp: new Date(),
      status: order.status,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      note: "Location updated",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        deliveryBoyLocation: order.deliveryBoyLocation,
      },
    });
  } catch (error) {
    console.error("Error updating order location:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/delivery-orders/stats
// @access   Private
exports.getOrderStats = async (req, res) => {
  try {
    const deliveryBoyId = req.deliveryBoy?._id || req.user?._id;

    if (!deliveryBoyId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No delivery boy ID found",
      });
    }

    console.log("🔍 Getting stats for delivery boy:", deliveryBoyId);

    // Use simpler count queries instead of aggregation to avoid mongoose issues
    try {
      const totalOrders = await DeliveryOrder.countDocuments({ deliveryBoyId });
      const completedOrders = await DeliveryOrder.countDocuments({
        deliveryBoyId,
        status: "delivered",
      });
      const pendingOrders = await DeliveryOrder.countDocuments({
        deliveryBoyId,
        status: "pending",
      });
      const inProgressOrders = await DeliveryOrder.countDocuments({
        deliveryBoyId,
        status: { $in: ["accepted", "picked_up"] },
      });

      // Get delivered orders for earnings calculation
      const deliveredOrders = await DeliveryOrder.find({
        deliveryBoyId,
        status: "delivered",
      }).select("deliveryBoyEarnings");

      const totalEarnings = deliveredOrders.reduce(
        (sum, order) => sum + (order.deliveryBoyEarnings || 0),
        0,
      );

      const result = {
        totalOrders,
        completedOrders,
        pendingOrders,
        inProgressOrders,
        totalEarnings,
        stats: [
          { _id: "pending", count: pendingOrders, totalEarnings: 0 },
          { _id: "accepted", count: 0, totalEarnings: 0 },
          { _id: "picked_up", count: 0, totalEarnings: 0 },
          { _id: "delivered", count: completedOrders, totalEarnings },
        ],
      };

      console.log("✅ Stats calculated successfully:", result);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (dbError) {
      console.error("❌ Database query error:", dbError);
      res.status(500).json({
        success: false,
        message: "Database query error",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error getting order stats:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

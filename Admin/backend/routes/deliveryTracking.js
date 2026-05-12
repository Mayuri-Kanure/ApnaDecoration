const express = require("express");
const router = express.Router();
const DeliveryTracking = require("../models/DeliveryTracking");
const DeliveryOrder = require("../models/DeliveryOrder");
const DeliveryBoy = require("../models/DeliveryBoy");
const auth = require("../middleware/deliveryAuth");
const { body, validationResult } = require("express-validator");

// Get active tracking for delivery boy
router.get("/active", auth, async (req, res) => {
  try {
    const tracking = await DeliveryTracking.getActiveTracking(
      req.deliveryBoy.id,
    ).populate({
      path: "deliveryOrderId",
      populate: [
        { path: "customerId", select: "name phone email" },
        { path: "vendorId", select: "name phone address" },
      ],
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "No active tracking found",
      });
    }

    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    console.error("Error fetching active tracking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update location
router.post(
  "/location",
  [
    auth,
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("accuracy").optional().isFloat({ min: 0 }),
    body("speed").optional().isFloat({ min: 0 }),
    body("heading").optional().isFloat({ min: 0, max: 360 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { latitude, longitude, accuracy, speed, heading } = req.body;
      const coordinates = [longitude, latitude];

      // Get active tracking
      let tracking = await DeliveryTracking.getActiveTracking(
        req.deliveryBoy.id,
      );

      if (!tracking) {
        return res.status(404).json({
          success: false,
          message: "No active delivery found",
        });
      }

      // Add location update
      await tracking.addLocationUpdate(coordinates, accuracy, speed, heading);

      // Update delivery boy's current location
      await DeliveryBoy.findByIdAndUpdate(req.deliveryBoy.id, {
        currentLocation: {
          latitude,
          longitude,
          lastUpdated: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Location updated successfully",
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// Start tracking for an order
router.post("/start/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and is assigned to this delivery boy
    const order = await DeliveryOrder.findOne({
      _id: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: "accepted",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    // Check if tracking already exists
    let tracking = await DeliveryTracking.findOne({
      deliveryOrderId: orderId,
      isActive: true,
    });

    if (tracking) {
      return res.status(400).json({
        success: false,
        message: "Tracking already started for this order",
      });
    }

    // Create new tracking
    tracking = new DeliveryTracking({
      deliveryOrderId: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: "in_transit",
    });

    await tracking.save();

    // Update order status
    await order.updateStatus("in_transit");

    res.json({
      success: true,
      message: "Tracking started successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error starting tracking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Update ETA
router.post(
  "/eta/:trackingId",
  [
    auth,
    body("estimatedArrival").isISO8601().toDate(),
    body("distanceRemaining").isFloat({ min: 0 }),
    body("durationRemaining").isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { trackingId } = req.params;
      const { estimatedArrival, distanceRemaining, durationRemaining } =
        req.body;

      const tracking = await DeliveryTracking.findOne({
        _id: trackingId,
        deliveryBoyId: req.deliveryBoy.id,
        isActive: true,
      });

      if (!tracking) {
        return res.status(404).json({
          success: false,
          message: "Tracking not found",
        });
      }

      await tracking.updateETA(
        estimatedArrival,
        distanceRemaining,
        durationRemaining,
      );

      res.json({
        success: true,
        message: "ETA updated successfully",
      });
    } catch (error) {
      console.error("Error updating ETA:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

// Complete tracking
router.post("/complete/:trackingId", auth, async (req, res) => {
  try {
    const { trackingId } = req.params;

    const tracking = await DeliveryTracking.findOne({
      _id: trackingId,
      deliveryBoyId: req.deliveryBoy.id,
      isActive: true,
    });

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }

    // Mark tracking as inactive
    tracking.isActive = false;
    tracking.actualArrival = new Date();
    await tracking.save();

    // Update order status
    const order = await DeliveryOrder.findById(tracking.deliveryOrderId);
    if (order) {
      await order.updateStatus("delivered");
    }

    res.json({
      success: true,
      message: "Tracking completed successfully",
    });
  } catch (error) {
    console.error("Error completing tracking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get tracking history for delivery boy
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = { deliveryBoyId: req.deliveryBoy.id, isActive: false };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const tracking = await DeliveryTracking.find(query)
      .populate("deliveryOrderId", "orderId customerName totalAmount status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryTracking.countDocuments(query);

    res.json({
      success: true,
      data: {
        tracking,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tracking history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;

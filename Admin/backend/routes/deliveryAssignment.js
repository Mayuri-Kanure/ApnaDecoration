const express = require('express');
const router = express.Router();
const DeliveryOrder = require('../models/DeliveryOrder');
const DeliveryBoy = require('../models/DeliveryBoy');
const DeliveryZone = require('../models/DeliveryZone');
const DeliveryTracking = require('../models/DeliveryTracking');
const DeliveryNotification = require('../models/DeliveryNotification');
const auth = require('../middleware/deliveryAuth');
const { body, validationResult } = require('express-validator');

// Get available orders for delivery boy
router.get('/available', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, radius = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get delivery boy's current location
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    
    if (!deliveryBoy.currentLocation || !deliveryBoy.currentLocation.latitude || !deliveryBoy.currentLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location not available. Please update your location first.'
      });
    }

    const { latitude, longitude } = deliveryBoy.currentLocation;

    // Find pending orders within radius
    const availableOrders = await DeliveryOrder.find({
      status: 'pending',
      deliveryBoyId: { $exists: false },
      'customerLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .populate('customerId', 'name phone')
    .populate('vendorId', 'name address')
    .skip(skip)
    .limit(parseInt(limit));

    // Calculate distance for each order
    const ordersWithDistance = availableOrders.map(order => {
      const distance = calculateDistance(
        latitude, longitude,
        order.customerLocation.coordinates[1],
        order.customerLocation.coordinates[0]
      );
      
      return {
        ...order.toObject(),
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    const total = await DeliveryOrder.countDocuments({
      status: 'pending',
      deliveryBoyId: { $exists: false }
    });

    res.json({
      success: true,
      data: {
        orders: ordersWithDistance,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Accept an order
router.post('/:orderId/accept', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await DeliveryOrder.findOne({
      _id: orderId,
      status: 'pending',
      deliveryBoyId: { $exists: false }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not available for assignment'
      });
    }

    // Check if delivery boy is available
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    if (!deliveryBoy.availability) {
      return res.status(400).json({
        success: false,
        message: 'You are currently unavailable for deliveries'
      });
    }

    // Check if delivery boy has too many active orders
    const activeOrdersCount = await DeliveryOrder.countDocuments({
      deliveryBoyId: req.deliveryBoy.id,
      status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] }
    });

    if (activeOrdersCount >= 5) { // Maximum 5 active orders
      return res.status(400).json({
        success: false,
        message: 'You have reached the maximum number of active orders'
      });
    }

    // Assign order to delivery boy
    order.deliveryBoyId = req.deliveryBoy.id;
    order.status = 'assigned';
    order.assignedDate = new Date();
    await order.save();

    // Create notification for customer
    await createNotification(
      order.customerId,
      'Customer',
      'Order Assigned',
      `Your order ${order.orderId} has been assigned to a delivery partner`,
      'order_assigned',
      'normal',
      {
        deliveryOrderId: order._id,
        deliveryBoyId: req.deliveryBoy.id
      }
    );

    // Create notification for vendor
    await createNotification(
      order.vendorId,
      'Vendor',
      'Order Assigned',
      `Order ${order.orderId} has been assigned to a delivery partner`,
      'order_assigned',
      'normal',
      {
        deliveryOrderId: order._id,
        deliveryBoyId: req.deliveryBoy.id
      }
    );

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reject an order
router.post('/:orderId/reject', [
  auth,
  body('reason').trim().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { reason } = req.body;

    // Find the order (should be assigned to this delivery boy)
    const order = await DeliveryOrder.findOne({
      _id: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: 'assigned'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Unassign the order
    order.deliveryBoyId = undefined;
    order.status = 'pending';
    order.assignedDate = undefined;
    await order.save();

    // Add note about rejection
    order.notes.push({
      note: `Rejected by delivery boy: ${reason}`,
      addedBy: req.deliveryBoy.id,
      noteModel: 'DeliveryBoy'
    });
    await order.save();

    res.json({
      success: true,
      message: 'Order rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Start delivery (pick up order)
router.post('/:orderId/start', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await DeliveryOrder.findOne({
      _id: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: 'accepted'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not accepted'
      });
    }

    // Update order status
    await order.updateStatus('picked_up');

    // Create tracking
    const tracking = new DeliveryTracking({
      deliveryOrderId: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: 'picked_up'
    });
    await tracking.save();

    // Notify customer
    await createNotification(
      order.customerId,
      'Customer',
      'Order Picked Up',
      `Your order ${order.orderId} has been picked up and is on the way`,
      'order_picked_up',
      'normal',
      {
        deliveryOrderId: order._id
      }
    );

    res.json({
      success: true,
      message: 'Delivery started successfully'
    });
  } catch (error) {
    console.error('Error starting delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Complete delivery
router.post('/:orderId/complete', [
  auth,
  body('proofImage').optional().isURL(),
  body('customerSignature').optional().isString(),
  body('deliveryPhoto').optional().isURL(),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { proofImage, customerSignature, deliveryPhoto, notes } = req.body;

    const order = await DeliveryOrder.findOne({
      _id: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: { $in: ['in_transit', 'picked_up'] }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in transit'
      });
    }

    // Update order status
    await order.updateStatus('delivered');

    // Update delivery boy stats
    await DeliveryBoy.findByIdAndUpdate(req.deliveryBoy.id, {
      $inc: {
        totalDeliveries: 1,
        successfulDeliveries: 1,
        totalEarnings: order.deliveryBoyEarnings || 0
      }
    });

    // Complete tracking
    const tracking = await DeliveryTracking.findOne({
      deliveryOrderId: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      isActive: true
    });

    if (tracking) {
      tracking.isActive = false;
      tracking.actualArrival = new Date();
      await tracking.save();
    }

    // Notify customer
    await createNotification(
      order.customerId,
      'Customer',
      'Order Delivered',
      `Your order ${order.orderId} has been delivered successfully`,
      'delivered',
      'normal',
      {
        deliveryOrderId: order._id
      }
    );

    res.json({
      success: true,
      message: 'Delivery completed successfully'
    });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark delivery as failed
router.post('/:orderId/failed', [
  auth,
  body('reason').trim().isLength({ min: 1, max: 200 }),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { reason, notes } = req.body;

    const order = await DeliveryOrder.findOne({
      _id: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      status: { $in: ['assigned', 'accepted', 'picked_up', 'in_transit'] }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus('failed', null, `Failed: ${reason}`);

    // Update delivery boy stats
    await DeliveryBoy.findByIdAndUpdate(req.deliveryBoy.id, {
      $inc: {
        totalDeliveries: 1,
        failedDeliveries: 1
      }
    });

    // Complete tracking
    const tracking = await DeliveryTracking.findOne({
      deliveryOrderId: orderId,
      deliveryBoyId: req.deliveryBoy.id,
      isActive: true
    });

    if (tracking) {
      tracking.isActive = false;
      await tracking.save();
    }

    // Notify admin about failed delivery
    await createNotification(
      null, // Will be set to admin
      'Admin',
      'Delivery Failed',
      `Order ${order.orderId} delivery failed: ${reason}`,
      'failed',
      'high',
      {
        deliveryOrderId: order._id,
        deliveryBoyId: req.deliveryBoy.id
      }
    );

    res.json({
      success: true,
      message: 'Delivery marked as failed'
    });
  } catch (error) {
    console.error('Error marking delivery as failed:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Helper function to create notifications
async function createNotification(recipientId, recipientType, title, message, type, priority, data = {}) {
  try {
    const notification = new DeliveryNotification({
      recipientId,
      recipientType,
      title,
      message,
      type,
      priority,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = router;

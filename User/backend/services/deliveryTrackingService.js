const DeliveryTracking = require('../models/DeliveryTracking');
const Order = require('../models/Order');
const User = require('../models/User');

class DeliveryTrackingService {
  // Create new delivery tracking
  async createDeliveryTracking(orderData) {
    try {
      console.log('🔧 Creating delivery tracking:', orderData);
      
      // Generate unique tracking number
      const trackingNumber = this.generateTrackingNumber();
      
      const deliveryTracking = new DeliveryTracking({
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        trackingNumber: trackingNumber,
        deliveryAddress: orderData.deliveryAddress,
        contactPhone: orderData.contactPhone,
        contactEmail: orderData.contactEmail,
        packageInfo: orderData.packageInfo,
        deliveryFee: orderData.deliveryFee || 0,
        priority: orderData.priority || 'standard',
        deliveryInstructions: orderData.deliveryInstructions,
        estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(orderData.priority)
      });

      const savedTracking = await deliveryTracking.save();
      console.log('✅ Delivery tracking created:', savedTracking);
      return savedTracking;
    } catch (error) {
      console.error('❌ Error creating delivery tracking:', error);
      throw new Error(error.message || 'Failed to create delivery tracking');
    }
  }

  // Get delivery tracking by tracking number
  async getTrackingByNumber(trackingNumber) {
    try {
      console.log('🔧 Getting tracking by number:', trackingNumber);
      
      const tracking = await DeliveryTracking.findOne({ trackingNumber })
        .populate('orderId', 'orderNumber totalAmount')
        .populate('customerId', 'firstName lastName email phone')
        .populate('deliveryBoyId', 'name phone');

      if (!tracking) {
        throw new Error('Tracking number not found');
      }

      console.log('✅ Tracking found:', tracking);
      return tracking;
    } catch (error) {
      console.error('❌ Error getting tracking:', error);
      throw new Error(error.message || 'Failed to get tracking information');
    }
  }

  // Get delivery tracking by order ID
  async getTrackingByOrderId(orderId) {
    try {
      console.log('🔧 Getting tracking by order ID:', orderId);
      
      const tracking = await DeliveryTracking.findOne({ orderId })
        .populate('orderId', 'orderNumber totalAmount')
        .populate('customerId', 'firstName lastName email phone')
        .populate('deliveryBoyId', 'name phone');

      if (!tracking) {
        throw new Error('No tracking found for this order');
      }

      console.log('✅ Tracking found:', tracking);
      return tracking;
    } catch (error) {
      console.error('❌ Error getting tracking by order ID:', error);
      throw new Error(error.message || 'Failed to get tracking information');
    }
  }

  // Get all tracking for a customer
  async getCustomerTracking(customerId, options = {}) {
    try {
      console.log('🔧 Getting customer tracking:', customerId);
      
      const {
        page = 1,
        limit = 20,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = { customerId };
      if (status && status !== 'all') {
        query.currentStatus = status;
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const tracking = await DeliveryTracking.find(query)
        .populate('orderId', 'orderNumber totalAmount')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await DeliveryTracking.countDocuments(query);

      console.log('✅ Customer tracking retrieved:', tracking.length);
      return {
        tracking,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting customer tracking:', error);
      throw new Error(error.message || 'Failed to get customer tracking');
    }
  }

  // Update tracking status
  async updateTrackingStatus(trackingId, status, location, description, updatedBy = 'system', coordinates = null) {
    try {
      console.log('🔧 Updating tracking status:', { trackingId, status, location, updatedBy });
      
      const tracking = await DeliveryTracking.findById(trackingId);
      
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      // Add tracking update
      await tracking.addTrackingUpdate(status, location, description, updatedBy);
      
      // Add coordinates if provided
      if (coordinates) {
        const lastUpdate = tracking.trackingHistory[tracking.trackingHistory.length - 1];
        lastUpdate.coordinates = coordinates;
        await tracking.save();
      }

      console.log('✅ Tracking status updated:', tracking);
      return tracking;
    } catch (error) {
      console.error('❌ Error updating tracking status:', error);
      throw new Error(error.message || 'Failed to update tracking status');
    }
  }

  // Assign delivery boy
  async assignDeliveryBoy(trackingId, deliveryBoyId) {
    try {
      console.log('🔧 Assigning delivery boy:', { trackingId, deliveryBoyId });
      
      const tracking = await DeliveryTracking.findById(trackingId);
      
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      tracking.deliveryBoyId = deliveryBoyId;
      tracking.updatedAt = new Date();
      
      // Add tracking update
      await tracking.addTrackingUpdate(
        'confirmed', 
        'Warehouse', 
        'Delivery boy assigned', 
        'system'
      );

      await tracking.save();
      console.log('✅ Delivery boy assigned:', tracking);
      return tracking;
    } catch (error) {
      console.error('❌ Error assigning delivery boy:', error);
      throw new Error(error.message || 'Failed to assign delivery boy');
    }
  }

  // Get tracking statistics
  async getTrackingStatistics(options = {}) {
    try {
      console.log('🔧 Getting tracking statistics');
      
      const {
        startDate,
        endDate,
        deliveryBoyId
      } = options;

      const matchStage = {};
      if (deliveryBoyId) {
        matchStage.deliveryBoyId = deliveryBoyId;
      }

      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) {
          matchStage.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          matchStage.createdAt.$lte = new Date(endDate);
        }
      }

      const stats = await DeliveryTracking.getDeliveryStatistics(startDate, endDate);
      
      console.log('✅ Tracking statistics retrieved:', stats);
      return stats[0] || {
        totalDeliveries: 0,
        pendingCount: 0,
        confirmedCount: 0,
        pickedUpCount: 0,
        inTransitCount: 0,
        outForDeliveryCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        returnedCount: 0,
        averageDeliveryTime: 0
      };
    } catch (error) {
      console.error('❌ Error getting tracking statistics:', error);
      throw new Error(error.message || 'Failed to get tracking statistics');
    }
  }

  // Get real-time tracking location
  async getTrackingLocation(trackingId) {
    try {
      console.log('🔧 Getting tracking location:', trackingId);
      
      const tracking = await DeliveryTracking.findById(trackingId);
      
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      // Get the latest location from tracking history
      const latestUpdate = tracking.trackingHistory[tracking.trackingHistory.length - 1];
      
      const locationData = {
        trackingNumber: tracking.trackingNumber,
        currentStatus: tracking.currentStatus,
        lastUpdate: latestUpdate,
        deliveryAddress: tracking.deliveryAddress,
        estimatedDeliveryTime: tracking.estimatedDeliveryTime
      };

      console.log('✅ Tracking location retrieved:', locationData);
      return locationData;
    } catch (error) {
      console.error('❌ Error getting tracking location:', error);
      throw new Error(error.message || 'Failed to get tracking location');
    }
  }

  // Generate unique tracking number
  generateTrackingNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `APNA${timestamp}${random}`;
  }

  // Calculate estimated delivery time based on priority
  calculateEstimatedDeliveryTime(priority) {
    const now = new Date();
    const deliveryTimes = {
      'standard': 5, // 5 days
      'express': 2, // 2 days
      'urgent': 1 // 1 day
    };
    
    const days = deliveryTimes[priority] || 5;
    const estimatedDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return estimatedDate;
  }

  // Get active deliveries for delivery boy
  async getActiveDeliveries(deliveryBoyId) {
    try {
      console.log('🔧 Getting active deliveries for delivery boy:', deliveryBoyId);
      
      const activeStatuses = ['confirmed', 'picked_up', 'in_transit', 'out_for_delivery'];
      
      const deliveries = await DeliveryTracking.find({
        deliveryBoyId: deliveryBoyId,
        currentStatus: { $in: activeStatuses }
      })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('customerId', 'firstName lastName phone')
      .sort({ createdAt: -1 });

      console.log('✅ Active deliveries retrieved:', deliveries.length);
      return deliveries;
    } catch (error) {
      console.error('❌ Error getting active deliveries:', error);
      throw new Error(error.message || 'Failed to get active deliveries');
    }
  }

  // Search tracking by customer info
  async searchTracking(searchTerm, options = {}) {
    try {
      console.log('🔧 Searching tracking:', searchTerm);
      
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Search by tracking number, customer name, phone, or order number
      const searchRegex = new RegExp(searchTerm, 'i');
      
      const tracking = await DeliveryTracking.find({
        $or: [
          { trackingNumber: searchRegex },
          { contactPhone: searchRegex },
          { 'deliveryAddress.street': searchRegex },
          { 'deliveryAddress.city': searchRegex },
          { 'deliveryAddress.pincode': searchRegex }
        ]
      })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('customerId', 'firstName lastName email phone')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

      const total = await DeliveryTracking.countDocuments({
        $or: [
          { trackingNumber: searchRegex },
          { contactPhone: searchRegex },
          { 'deliveryAddress.street': searchRegex },
          { 'deliveryAddress.city': searchRegex },
          { 'deliveryAddress.pincode': searchRegex }
        ]
      });

      console.log('✅ Tracking search completed:', tracking.length);
      return {
        tracking,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error searching tracking:', error);
      throw new Error(error.message || 'Failed to search tracking');
    }
  }
}

module.exports = new DeliveryTrackingService();

const deliveryTrackingService = require('../services/deliveryTrackingService');
const { validationResult } = require('express-validator');

// Create delivery tracking
exports.createDeliveryTracking = async (req, res) => {
  try {
    console.log('📝 Create delivery tracking request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      orderId,
      customerId,
      deliveryAddress,
      contactPhone,
      contactEmail,
      packageInfo,
      deliveryFee,
      priority,
      deliveryInstructions
    } = req.body;

    const trackingData = {
      orderId,
      customerId,
      deliveryAddress,
      contactPhone,
      contactEmail,
      packageInfo,
      deliveryFee,
      priority,
      deliveryInstructions
    };

    const tracking = await deliveryTrackingService.createDeliveryTracking(trackingData);
    
    res.status(201).json({
      success: true,
      message: 'Delivery tracking created successfully',
      data: tracking
    });
  } catch (error) {
    console.error('❌ Error creating delivery tracking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create delivery tracking'
    });
  }
};

// Get tracking by tracking number
exports.getTrackingByNumber = async (req, res) => {
  try {
    console.log('📝 Get tracking by number request:', req.params);
    
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const tracking = await deliveryTrackingService.getTrackingByNumber(trackingNumber);
    
    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('❌ Error getting tracking:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Tracking not found'
    });
  }
};

// Get tracking by order ID
exports.getTrackingByOrderId = async (req, res) => {
  try {
    console.log('📝 Get tracking by order ID request:', req.params);
    
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const tracking = await deliveryTrackingService.getTrackingByOrderId(orderId);
    
    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    console.error('❌ Error getting tracking by order ID:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Tracking not found'
    });
  }
};

// Get customer tracking
exports.getCustomerTracking = async (req, res) => {
  try {
    console.log('📝 Get customer tracking request:', req.query);
    
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    };

    const result = await deliveryTrackingService.getCustomerTracking(req.user.userId, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting customer tracking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get customer tracking'
    });
  }
};

// Update tracking status
exports.updateTrackingStatus = async (req, res) => {
  try {
    console.log('📝 Update tracking status request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { status, location, description, updatedBy, coordinates } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const tracking = await deliveryTrackingService.updateTrackingStatus(
      id, 
      status, 
      location, 
      description, 
      updatedBy || 'system',
      coordinates
    );
    
    res.json({
      success: true,
      message: 'Tracking status updated successfully',
      data: tracking
    });
  } catch (error) {
    console.error('❌ Error updating tracking status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tracking status'
    });
  }
};

// Assign delivery boy
exports.assignDeliveryBoy = async (req, res) => {
  try {
    console.log('📝 Assign delivery boy request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { deliveryBoyId } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const tracking = await deliveryTrackingService.assignDeliveryBoy(id, deliveryBoyId);
    
    res.json({
      success: true,
      message: 'Delivery boy assigned successfully',
      data: tracking
    });
  } catch (error) {
    console.error('❌ Error assigning delivery boy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign delivery boy'
    });
  }
};

// Get tracking statistics
exports.getTrackingStatistics = async (req, res) => {
  try {
    console.log('📝 Get tracking statistics request:', req.query);
    
    const {
      startDate,
      endDate,
      deliveryBoyId
    } = req.query;

    const options = {
      startDate,
      endDate,
      deliveryBoyId
    };

    const stats = await deliveryTrackingService.getTrackingStatistics(options);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting tracking statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tracking statistics'
    });
  }
};

// Get tracking location
exports.getTrackingLocation = async (req, res) => {
  try {
    console.log('📝 Get tracking location request:', req.params);
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required'
      });
    }

    const locationData = await deliveryTrackingService.getTrackingLocation(id);
    
    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    console.error('❌ Error getting tracking location:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tracking location'
    });
  }
};

// Get active deliveries for delivery boy
exports.getActiveDeliveries = async (req, res) => {
  try {
    console.log('📝 Get active deliveries request:', req.params);
    
    const { deliveryBoyId } = req.params;

    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const deliveries = await deliveryTrackingService.getActiveDeliveries(deliveryBoyId);
    
    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('❌ Error getting active deliveries:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get active deliveries'
    });
  }
};

// Search tracking
exports.searchTracking = async (req, res) => {
  try {
    console.log('📝 Search tracking request:', req.query);
    
    const {
      searchTerm,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await deliveryTrackingService.searchTracking(searchTerm, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error searching tracking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search tracking'
    });
  }
};

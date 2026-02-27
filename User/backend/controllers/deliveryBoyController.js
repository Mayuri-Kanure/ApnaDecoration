const deliveryBoyService = require('../services/deliveryBoyService');
const { validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drrlkntpx',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret'
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apna-decoration/delivery-men/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'limit', quality: 'auto' }
    ]
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `delivery-boy-${uniqueSuffix}`);
  }
});

const upload = multer({ storage: storage });

// Create delivery boy
exports.createDeliveryBoy = async (req, res) => {
  try {
    console.log('📝 Create delivery boy request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const deliveryBoy = await deliveryBoyService.createDeliveryBoy(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Delivery boy created successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error creating delivery boy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create delivery boy'
    });
  }
};

// Login delivery boy
exports.loginDeliveryBoy = async (req, res) => {
  try {
    console.log('📝 Delivery boy login request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const result = await deliveryBoyService.loginDeliveryBoy(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('❌ Error logging in delivery boy:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get all delivery boys
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    console.log('📝 Get all delivery boys request:', req.query);
    
    const {
      page = 1,
      limit = 20,
      status,
      isAvailable,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
      sortBy,
      sortOrder
    };

    const result = await deliveryBoyService.getAllDeliveryBoys(options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting delivery boys:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery boys'
    });
  }
};

// Get delivery boy by ID
exports.getDeliveryBoyById = async (req, res) => {
  try {
    console.log('📝 Get delivery boy by ID request:', req.params);
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const deliveryBoy = await deliveryBoyService.getDeliveryBoyById(id);
    
    res.json({
      success: true,
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error getting delivery boy:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Delivery boy not found'
    });
  }
};

// Update delivery boy
exports.updateDeliveryBoy = async (req, res) => {
  try {
    console.log('📝 Update delivery boy request:', req.body);
    
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
    const updateData = req.body;

    const deliveryBoy = await deliveryBoyService.updateDeliveryBoy(id, updateData);
    
    res.json({
      success: true,
      message: 'Delivery boy updated successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error updating delivery boy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update delivery boy'
    });
  }
};

// Delete delivery boy
exports.deleteDeliveryBoy = async (req, res) => {
  try {
    console.log('📝 Delete delivery boy request:', req.params);
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const result = await deliveryBoyService.deleteDeliveryBoy(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Error deleting delivery boy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete delivery boy'
    });
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  try {
    console.log('📝 Update availability request:', req.body);
    
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
    const { isAvailable, currentLocation, coordinates } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean'
      });
    }

    const deliveryBoy = await deliveryBoyService.updateAvailability(
      id, 
      isAvailable, 
      currentLocation, 
      coordinates
    );
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update availability'
    });
  }
};

// Get available delivery boys
exports.getAvailableDeliveryBoys = async (req, res) => {
  try {
    console.log('📝 Get available delivery boys request');
    
    const deliveryBoys = await deliveryBoyService.getAvailableDeliveryBoys();
    
    res.json({
      success: true,
      data: deliveryBoys
    });
  } catch (error) {
    console.error('❌ Error getting available delivery boys:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get available delivery boys'
    });
  }
};

// Get delivery boys by location
exports.getDeliveryBoysByLocation = async (req, res) => {
  try {
    console.log('📝 Get delivery boys by location request:', req.query);
    
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const deliveryBoys = await deliveryBoyService.getDeliveryBoysByLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );
    
    res.json({
      success: true,
      data: deliveryBoys
    });
  } catch (error) {
    console.error('❌ Error getting delivery boys by location:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery boys by location'
    });
  }
};

// Update performance metrics
exports.updatePerformanceMetrics = async (req, res) => {
  try {
    console.log('📝 Update performance metrics request:', req.body);
    
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
    const { deliveryStatus, deliveryTime } = req.body;

    if (!deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: 'Delivery status is required'
      });
    }

    const deliveryBoy = await deliveryBoyService.updatePerformanceMetrics(
      id, 
      deliveryStatus, 
      deliveryTime
    );
    
    res.json({
      success: true,
      message: 'Performance metrics updated successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error updating performance metrics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update performance metrics'
    });
  }
};

// Add rating
exports.addRating = async (req, res) => {
  try {
    console.log('📝 Add rating request:', req.body);
    
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
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const deliveryBoy = await deliveryBoyService.addRating(id, parseInt(rating));
    
    res.json({
      success: true,
      message: 'Rating added successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error adding rating:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add rating'
    });
  }
};

// Get delivery statistics
exports.getDeliveryBoyStatistics = async (req, res) => {
  try {
    console.log('📝 Get delivery statistics request:', req.query);
    
    const {
      startDate,
      endDate
    } = req.query;

    const options = {
      startDate,
      endDate
    };

    const stats = await deliveryBoyService.getDeliveryBoyStatistics(options);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting delivery statistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get delivery statistics'
    });
  }
};

// Search delivery boys
exports.searchDeliveryBoys = async (req, res) => {
  try {
    console.log('📝 Search delivery boys request:', req.query);
    
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

    const result = await deliveryBoyService.searchDeliveryBoys(searchTerm, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error searching delivery boys:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search delivery boys'
    });
  }
};

// Get performance report
exports.getPerformanceReport = async (req, res) => {
  try {
    console.log('📝 Get performance report request:', req.params, req.query);
    
    const { id } = req.params;
    const {
      startDate,
      endDate
    } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const report = await deliveryBoyService.getPerformanceReport(id, startDate, endDate);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('❌ Error getting performance report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get performance report'
    });
  }
};

// Get delivery boy profile
exports.getProfile = async (req, res) => {
  try {
    console.log('📝 Get delivery boy profile request');
    console.log('🔍 req.user object:', JSON.stringify(req.user, null, 2));
    
    // Get delivery boy ID from authenticated user (not from URL params)
    const deliveryBoyId = req.user?._id || req.user?.userId;
    console.log('🔍 extracted deliveryBoyId:', deliveryBoyId);
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const deliveryBoy = await deliveryBoyService.getDeliveryBoyById(deliveryBoyId);
    
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    console.log('✅ Delivery boy profile data:', JSON.stringify(deliveryBoy, null, 2));

    res.json({
      success: true,
      data: deliveryBoy
    });
  } catch (error) {
    console.error('❌ Error getting delivery boy:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get profile'
    });
  }
};

// Update delivery boy profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('📝 Update delivery boy profile request:', req.body);
    console.log('🔍 req.user object:', JSON.stringify(req.user, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Get delivery boy ID from authenticated user
    const deliveryBoyId = req.user?._id || req.user?.userId;
    console.log('🔍 extracted deliveryBoyId:', deliveryBoyId);
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const updatedDeliveryBoy = await deliveryBoyService.updateDeliveryBoy(
      deliveryBoyId, 
      req.body
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDeliveryBoy
    });
  } catch (error) {
    console.error('❌ Error updating delivery boy profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};


// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('📤 Upload profile image request');
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get the delivery boy ID from the authenticated user
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    // Update delivery boy profile with new image URL
    const updatedDeliveryBoy = await deliveryBoyService.updateProfileImage(
      deliveryBoyId, 
      req.file.path // Cloudinary URL
    );

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        public_id: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};

// Get earnings data
exports.getEarnings = async (req, res) => {
  try {
    console.log('📝 Get earnings request');
    
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const earnings = await deliveryBoyService.getEarnings(deliveryBoyId, req.query);
    
    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    console.error('❌ Error getting earnings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get earnings'
    });
  }
};

// Get earnings statistics
exports.getEarningsStats = async (req, res) => {
  try {
    console.log('📝 Get earnings stats request');
    
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const stats = await deliveryBoyService.getEarningsStats(deliveryBoyId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting earnings stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get earnings stats'
    });
  }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    console.log('📝 Request withdrawal request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const deliveryBoyId = req.user?._id || req.user?.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid withdrawal amount is required'
      });
    }

    const withdrawal = await deliveryBoyService.requestWithdrawal(deliveryBoyId, amount);
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    });
  } catch (error) {
    console.error('❌ Error requesting withdrawal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to request withdrawal'
    });
  }
};

// Get delivery boy settings
exports.getSettings = async (req, res) => {
  try {
    console.log('📝 Get delivery boy settings request');
    
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const settings = await deliveryBoyService.getSettings(deliveryBoyId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get settings'
    });
  }
};

// Update delivery boy settings
exports.updateSettings = async (req, res) => {
  try {
    console.log('📝 Update delivery boy settings request:', req.body);
    
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    const settings = await deliveryBoyService.updateSettings(deliveryBoyId, req.body);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    console.log('📝 Change password request');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const deliveryBoyId = req.user?._id || req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    await deliveryBoyService.changePassword(deliveryBoyId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    console.log('📝 Delete account request');
    
    const deliveryBoyId = req.user?._id || req.user?.userId;
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }

    await deliveryBoyService.deleteAccount(deliveryBoyId);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete account'
    });
  }
};

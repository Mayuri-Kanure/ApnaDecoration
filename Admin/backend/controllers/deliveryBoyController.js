const DeliveryBoy = require('../models/DeliveryBoy');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new delivery boy
// @route   POST /api/delivery-boy/register
// @access   Public
exports.registerDeliveryBoy = async (req, res) => {
  try {
    console.log('🔍 DeliveryBoy model schema paths:', Object.keys(DeliveryBoy.schema.paths));
    console.log('🔍 Required fields:', DeliveryBoy.schema.requiredPaths());
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      bankAccount,
      ifscCode,
      bankName
    } = req.body;

    // Check if delivery boy already exists
    const existingDeliveryBoy = await DeliveryBoy.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingDeliveryBoy) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy with this email or phone already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create delivery boy
    const deliveryBoy = await DeliveryBoy.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      bankDetails: {
        bankAccount,
        ifscCode,
        bankName,
        accountHolderName: `${firstName} ${lastName}`
      }
    });

    // Generate token
    const token = generateToken(deliveryBoy._id);

    res.status(201).json({
      success: true,
      message: 'Delivery boy registered successfully',
      data: {
        deliveryBoy: {
          id: deliveryBoy._id,
          firstName: deliveryBoy.firstName,
          lastName: deliveryBoy.lastName,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          vehicleType: deliveryBoy.vehicleType,
          vehicleNumber: deliveryBoy.vehicleNumber,
          isVerified: deliveryBoy.isVerified,
          status: deliveryBoy.status
        },
        token
      }
    });
  } catch (error) {
    console.error('Error registering delivery boy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login delivery boy
// @route   POST /api/delivery-boy/login
// @access   Public
exports.loginDeliveryBoy = async (req, res) => {
  try {
    console.log('🔍 Delivery Boy Login Attempt:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find delivery boy
    const deliveryBoy = await DeliveryBoy.findOne({ email }).select('+password');

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, deliveryBoy.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if verified (temporarily disabled for testing)
    // if (!deliveryBoy.isVerified) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Account not verified. Please wait for admin approval.'
    //   });
    // }

    // Update last active
    deliveryBoy.lastActive = new Date();
    await deliveryBoy.save();

    // Generate token
    const token = generateToken(deliveryBoy._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        deliveryBoy: {
          id: deliveryBoy._id,
          deliveryBoyId: deliveryBoy.deliveryBoyId,
          firstName: deliveryBoy.firstName,
          lastName: deliveryBoy.lastName,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          vehicleType: deliveryBoy.vehicleType,
          vehicleNumber: deliveryBoy.vehicleNumber,
          isVerified: deliveryBoy.isVerified,
          status: deliveryBoy.status,
          isAvailable: deliveryBoy.isAvailable,
          totalEarnings: deliveryBoy.totalEarnings,
          availableBalance: deliveryBoy.availableBalance,
          averageRating: deliveryBoy.averageRating,
          totalDeliveries: deliveryBoy.totalDeliveries
        },
        token
      }
    });
  } catch (error) {
    console.error('Error logging in delivery boy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get delivery boy profile
// @route   GET /api/delivery-boy/profile
// @access   Private
exports.getDeliveryBoyProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: deliveryBoy._id,
        deliveryBoyId: deliveryBoy.deliveryBoyId,
        firstName: deliveryBoy.firstName,
        lastName: deliveryBoy.lastName,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        profileImage: deliveryBoy.profileImage,
        vehicleType: deliveryBoy.vehicleType,
        vehicleNumber: deliveryBoy.vehicleNumber,
        vehicleDocuments: deliveryBoy.vehicleDocuments,
        address: deliveryBoy.address,
        bankDetails: deliveryBoy.bankDetails,
        isAvailable: deliveryBoy.isAvailable,
        isVerified: deliveryBoy.isVerified,
        status: deliveryBoy.status,
        currentLocation: deliveryBoy.currentLocation,
        totalDeliveries: deliveryBoy.totalDeliveries,
        successfulDeliveries: deliveryBoy.successfulDeliveries,
        failedDeliveries: deliveryBoy.failedDeliveries,
        averageRating: deliveryBoy.averageRating,
        totalRatings: deliveryBoy.totalRatings,
        totalEarnings: deliveryBoy.totalEarnings,
        availableBalance: deliveryBoy.availableBalance,
        lastActive: deliveryBoy.lastActive
      }
    });
  } catch (error) {
    console.error('Error getting delivery boy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery boy profile
// @route   PUT /api/delivery-boy/profile
// @access   Private
exports.updateDeliveryBoyProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      vehicleType,
      vehicleNumber,
      address,
      bankDetails
    } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    // Update fields
    if (firstName) deliveryBoy.firstName = firstName;
    if (lastName) deliveryBoy.lastName = lastName;
    if (phone) deliveryBoy.phone = phone;
    if (vehicleType) deliveryBoy.vehicleType = vehicleType;
    if (vehicleNumber) deliveryBoy.vehicleNumber = vehicleNumber;
    if (address) deliveryBoy.address = address;
    if (bankDetails) deliveryBoy.bankDetails = bankDetails;

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: deliveryBoy._id,
        deliveryBoyId: deliveryBoy.deliveryBoyId,
        firstName: deliveryBoy.firstName,
        lastName: deliveryBoy.lastName,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        vehicleType: deliveryBoy.vehicleType,
        vehicleNumber: deliveryBoy.vehicleNumber,
        address: deliveryBoy.address,
        bankDetails: deliveryBoy.bankDetails,
        isAvailable: deliveryBoy.isAvailable,
        isVerified: deliveryBoy.isVerified,
        status: deliveryBoy.status
      }
    });
  } catch (error) {
    console.error('Error updating delivery boy profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery boy availability
// @route   PUT /api/delivery-boy/availability
// @access   Private
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    deliveryBoy.isAvailable = isAvailable;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${isAvailable ? 'Available' : 'Unavailable'}`,
      data: {
        isAvailable: deliveryBoy.isAvailable
      }
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery boy location
// @route   PUT /api/delivery-boy/location
// @access   Private
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    deliveryBoy.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    deliveryBoy.lastActive = new Date();
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        currentLocation: deliveryBoy.currentLocation,
        lastActive: deliveryBoy.lastActive
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get delivery boy dashboard stats
// @route   GET /api/delivery-boy/dashboard
// @access   Private
exports.getDashboardStats = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    // Get today's earnings (mock data for now)
    const todayEarnings = deliveryBoy.totalEarnings * 0.1; // 10% of total as today's
    const weeklyEarnings = deliveryBoy.totalEarnings * 0.3; // 30% of total as weekly

    res.status(200).json({
      success: true,
      data: {
        todayEarnings: todayEarnings,
        totalDeliveries: deliveryBoy.totalDeliveries,
        averageRating: deliveryBoy.averageRating,
        availableBalance: deliveryBoy.availableBalance,
        totalEarnings: deliveryBoy.totalEarnings,
        weeklyEarnings: weeklyEarnings,
        successfulDeliveries: deliveryBoy.successfulDeliveries,
        failedDeliveries: deliveryBoy.failedDeliveries,
        isAvailable: deliveryBoy.isAvailable,
        lastActive: deliveryBoy.lastActive
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout delivery boy
// @route   POST /api/delivery-boy/logout
// @access   Private
exports.logoutDeliveryBoy = async (req, res) => {
  try {
    // Update last active
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);
    if (deliveryBoy) {
      deliveryBoy.lastActive = new Date();
      await deliveryBoy.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error logging out delivery boy:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

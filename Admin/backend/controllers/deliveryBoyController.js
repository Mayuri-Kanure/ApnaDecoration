const DeliveryBoy = require("../models/DeliveryBoy");
const DeliveryOrder = require("../models/DeliveryOrder");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, role: "delivery_boy" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const normalizePhone = (phone) => {
  if (!phone) return phone;
  let digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
};

const formatRegisterError = (error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return {
      status: 400,
      body: {
        success: false,
        message: messages[0] || "Invalid registration data",
        errors: messages,
      },
    };
  }
  if (error.code === 11000) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Email or phone number is already registered",
      },
    };
  }
  return {
    status: 500,
    body: {
      success: false,
      message: "Server error",
    },
  };
};

// @desc    Register new delivery boy
// @route   POST /api/delivery-boy/register
// @access   Public
exports.registerDeliveryBoy = async (req, res) => {
  try {
    console.log(
      "🔍 DeliveryBoy model schema paths:",
      Object.keys(DeliveryBoy.schema.paths),
    );
    console.log("🔍 Required fields:", DeliveryBoy.schema.requiredPaths());

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone: rawPhone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicense,
      bankAccount,
      ifscCode: rawIfsc,
      bankName,
    } = req.body;

    const normalizedEmail = String(email).trim().toLowerCase();
    const phone = normalizePhone(rawPhone);
    const ifscCode = String(rawIfsc || "")
      .trim()
      .toUpperCase();
    const normalizedVehicleNumber = String(vehicleNumber || "")
      .trim()
      .toUpperCase();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)",
      });
    }

    // Check if delivery boy already exists
    const existingDeliveryBoy = await DeliveryBoy.findOne({
      $or: [{ email: normalizedEmail }, { phone }],
    });

    if (existingDeliveryBoy) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy with this email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique delivery boy ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const deliveryBoyId = `DB${timestamp}${random}`;

    // Create delivery boy
    const deliveryBoy = await DeliveryBoy.create({
      deliveryBoyId,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      vehicleType,
      vehicleNumber: normalizedVehicleNumber,
      drivingLicense: drivingLicense ? String(drivingLicense).trim() : null,
      bankDetails: {
        bankAccount: String(bankAccount).trim(),
        ifscCode,
        bankName: bankName ? String(bankName).trim() : "",
        accountHolderName: `${String(firstName).trim()} ${String(lastName).trim()}`,
      },
    });

    // Generate token
    const token = generateToken(deliveryBoy._id);

    res.status(201).json({
      success: true,
      message: "Delivery boy registered successfully",
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
          status: deliveryBoy.status,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error registering delivery boy:", error);
    const { status, body } = formatRegisterError(error);
    res.status(status).json(body);
  }
};

// @desc    Login delivery boy
// @route   POST /api/delivery-boy/login
// @access   Public
exports.loginDeliveryBoy = async (req, res) => {
  try {
    console.log("🔍 Delivery Boy Login Attempt:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Find delivery boy
    const deliveryBoy = await DeliveryBoy.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, deliveryBoy.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last active
    deliveryBoy.lastActive = new Date();
    deliveryBoy.status = "active";
    deliveryBoy.isVerified = true;
    deliveryBoy.availability = true;
    await deliveryBoy.save();

    // Fetch fresh data to return updated values
    const freshDeliveryBoy = await DeliveryBoy.findById(deliveryBoy._id);

    // Generate token
    const token = generateToken(deliveryBoy._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        deliveryBoy: {
          id: freshDeliveryBoy._id,
          deliveryBoyId: freshDeliveryBoy.deliveryBoyId,
          firstName: freshDeliveryBoy.firstName,
          lastName: freshDeliveryBoy.lastName,
          email: freshDeliveryBoy.email,
          phone: freshDeliveryBoy.phone,
          vehicleType: freshDeliveryBoy.vehicleType,
          vehicleNumber: freshDeliveryBoy.vehicleNumber,
          isVerified: freshDeliveryBoy.isVerified,
          status: freshDeliveryBoy.status,
          isAvailable: freshDeliveryBoy.availability,
          totalEarnings: freshDeliveryBoy.totalEarnings,
          availableBalance: freshDeliveryBoy.availableBalance,
          averageRating: freshDeliveryBoy.averageRating,
          totalDeliveries: freshDeliveryBoy.totalDeliveries,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in delivery boy:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
        message: "Delivery boy not found",
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
        lastActive: deliveryBoy.lastActive,
      },
    });
  } catch (error) {
    console.error("Error getting delivery boy profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
      bankDetails,
    } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
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
      message: "Profile updated successfully",
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
        status: deliveryBoy.status,
      },
    });
  } catch (error) {
    console.error("Error updating delivery boy profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
        message: "Delivery boy not found",
      });
    }

    deliveryBoy.isAvailable = isAvailable;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `Status updated to ${isAvailable ? "Available" : "Unavailable"}`,
      data: {
        isAvailable: deliveryBoy.isAvailable,
      },
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update delivery boy location
// @route   PUT /api/delivery-boy/location
// @access   Private
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate latitude and longitude
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be numbers",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy.id);

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    deliveryBoy.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    deliveryBoy.lastActive = new Date();
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        currentLocation: deliveryBoy.currentLocation,
        lastActive: deliveryBoy.lastActive,
      },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
        message: "Delivery boy not found",
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
        lastActive: deliveryBoy.lastActive,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out delivery boy:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get pending orders count for badge
// @route   GET /api/delivery-boy/pending-orders-count
// @access   Private
exports.getPendingOrdersCount = async (req, res) => {
  try {
    const count = await DeliveryOrder.countDocuments({
      assignedDeliveryBoy: req.deliveryBoy.id,
      status: { $in: ["pending", "accepted", "in_progress"] }
    });

    res.status(200).json({
      success: true,
      count,
      message: "Pending orders count retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching pending orders count:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending orders count",
      error: error.message
    });
  }
};

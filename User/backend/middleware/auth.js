const jwt = require("jsonwebtoken");
const { User } = require("../models");
const DeliveryBoy = require("../models/DeliveryBoy");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔍 AUTH MIDDLEWARE HIT");

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    console.log("🔍 Token found, verifying...");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "apna_decoration_secure_key",
    );

    console.log("🔍 Token decoded:", decoded);

    // Support both user tokens and delivery-boy tokens.
    if (decoded.deliveryBoyId || decoded.id) {
      const deliveryBoy = await DeliveryBoy.findById(
        decoded.deliveryBoyId || decoded.id,
      );
      if (!deliveryBoy) {
        return res.status(401).json({
          success: false,
          error: "Delivery partner not found",
        });
      }

      req.user = {
        ...deliveryBoy.toObject(),
        _id: deliveryBoy._id,
        userId: deliveryBoy._id,
        role: decoded.role || "delivery_boy",
        tokenType: "delivery_boy",
      };

      return next();
    }

    console.log("🔍 Looking up user with ID:", decoded.id || decoded.userId);
    const user = await User.findById(decoded.id || decoded.userId);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("🔍 User found:", user._id, user.email);

    req.user = user;
    req.user.userId = user._id ? user._id.toString() : user.id;
    req.user.id = user._id ? user._id.toString() : user.id; // Add this line
    req.user.tokenType = "user";

    console.log("🔍 Auth middleware completed successfully");
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No user authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  auth: authMiddleware,
  authMiddleware,
  authorize,
};

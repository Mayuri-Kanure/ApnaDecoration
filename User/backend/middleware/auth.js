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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Your session has expired. Please login again.",
        });
      }
      throw jwtError;
    }

    console.log("🔍 Token decoded:", JSON.stringify(decoded, null, 2));
    console.log("🔍 Token keys:", Object.keys(decoded));
    console.log("🔍 decoded.deliveryBoyId:", decoded.deliveryBoyId);
    console.log("🔍 decoded.userId:", decoded.userId);
    console.log("🔍 decoded.id:", decoded.id);
    console.log("🔍 decoded.role:", decoded.role);
    console.log("🔍 Boolean check - decoded.deliveryBoyId is truthy?:", !!decoded.deliveryBoyId);
    console.log("🔍 Type of decoded.deliveryBoyId:", typeof decoded.deliveryBoyId);
    console.log("🔍 decoded.deliveryBoyId value:", decoded.deliveryBoyId);

    // If it's explicitly a delivery boy token, look for delivery boy
    if (decoded.deliveryBoyId) {
      console.log("🔍 Detected delivery boy token, searching with ID:", decoded.deliveryBoyId);

      const deliveryBoy = await DeliveryBoy.findById(decoded.deliveryBoyId);
      console.log("🔍 Found delivery boy:", deliveryBoy ? "YES" : "NO");

      if (!deliveryBoy) {
        console.log("❌ Delivery boy not found in database");
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

    // Otherwise, try to find as regular User (including vendors)
    console.log("🔍 Detected user/vendor token, looking up user with ID:", decoded.id || decoded.userId);
    const user = await User.findById(decoded.id || decoded.userId);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("🔍 User found:", user._id, user.email, "Role:", user.role);

    req.user = user;
    req.user.userId = user._id ? user._id.toString() : user.id;
    req.user.id = user._id ? user._id.toString() : user.id;
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

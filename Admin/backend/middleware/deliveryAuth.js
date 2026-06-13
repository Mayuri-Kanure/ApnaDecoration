const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/DeliveryBoy");

// Protect delivery boy routes
const protectDeliveryBoy = async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get delivery boy from token
    const deliveryBoy = await DeliveryBoy.findById(decoded.id).select(
      "-password",
    );

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    // Check if delivery boy is verified
    if (!deliveryBoy.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Account not verified.",
      });
    }

    // Check if delivery boy is active (only allow active status)
    if (deliveryBoy.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Account is not active.",
      });
    }

    // Check role - ensure user is a delivery boy
    if (!decoded.role || decoded.role !== "delivery_boy") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    // Add delivery boy to request object
    req.deliveryBoy = deliveryBoy;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Handle token expiration specifically
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid token.",
    });
  }
};

module.exports = { protectDeliveryBoy };

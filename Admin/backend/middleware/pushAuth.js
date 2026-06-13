const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DeliveryBoy = require("../models/DeliveryBoy");

/**
 * Auth for push register/test — vendor, delivery, admin staff tokens.
 */
async function pushAuth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key",
    );

    if (!decoded.userId && decoded.id) {
      const deliveryBoy = await DeliveryBoy.findById(decoded.id);
      if (deliveryBoy) {
        req.pushUser = {
          userId: deliveryBoy._id,
          appRole: "delivery",
        };
        return next();
      }
    }

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    let appRole = "admin";
    if (user.role === "vendor") appRole = "vendor";
    else if (["admin", "manager", "staff"].includes(user.role)) appRole = "admin";

    req.pushUser = { userId: user._id, appRole };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { pushAuth };

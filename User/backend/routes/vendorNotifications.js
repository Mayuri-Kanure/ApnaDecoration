const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { Notification } = require("../models");
const router = express.Router();

// Get vendor notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const vendorId = req.user.userId || req.user.id || req.user._id;
    
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        error: "Vendor not authenticated"
      });
    }

    console.log("🔔 Fetching notifications for vendor:", vendorId);

    // Fetch notifications for vendor
    const notifications = await Notification.find({
      userId: vendorId
    })
    .sort({ createdAt: -1 })
    .limit(20);

    const unreadCount = await Notification.countDocuments({
      userId: vendorId,
      read: false
    });

    console.log("🔔 Found notifications:", notifications.length, "Unread:", unreadCount);

    res.json({
      success: true,
      message: "Notifications retrieved successfully",
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    });
  } catch (error) {
    console.error("❌ Error fetching vendor notifications:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notifications",
      message: error.message
    });
  }
});

// Mark notification as read
router.put("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const vendorId = req.user.userId || req.user.id || req.user._id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found"
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark notification as read"
    });
  }
});

module.exports = router;

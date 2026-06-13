const { validationResult } = require("express-validator");
const DeviceToken = require("../models/DeviceToken");
const pushNotificationService = require("../services/pushNotificationService");
const { sendPushToRecipient } = require("../utils/pushNotificationHelper");

exports.registerDevice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId, appRole } = req.pushUser;
    const {
      deviceToken,
      platform,
      platformVersion,
      deviceModel,
      appVersion,
    } = req.body;

    const token = pushNotificationService.validateDeviceToken(deviceToken);

    const record = await DeviceToken.findOneAndUpdate(
      { userId, appRole, token },
      {
        userId,
        appRole,
        token,
        platform: platform || "android",
        platformVersion,
        deviceModel,
        appVersion,
        isActive: true,
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({
      success: true,
      message: "Device registered for push notifications",
      data: { id: record._id, appRole: record.appRole },
    });
  } catch (error) {
    console.error("registerDevice:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register device",
    });
  }
};

exports.unregisterDevice = async (req, res) => {
  try {
    const { userId, appRole } = req.pushUser;
    const { deviceToken } = req.body;

    const query = { userId, appRole };
    if (deviceToken) query.token = deviceToken;

    await DeviceToken.updateMany(query, { isActive: false });

    res.json({
      success: true,
      message: "Device unregistered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unregister device",
    });
  }
};

exports.sendTestToMe = async (req, res) => {
  try {
    const { userId, appRole } = req.pushUser;
    const labels = {
      vendor: "Vendor",
      delivery: "Delivery",
      admin: "Admin",
    };
    const result = await sendPushToRecipient(
      userId,
      appRole,
      {
        title: `Apna Decoration ${labels[appRole] || "App"}`,
        body: "Push notifications are working!",
      },
      { type: "test" },
    );

    res.json({
      success: true,
      message: "Test notification sent",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send test",
    });
  }
};

exports.sendToMultipleDevices = async (req, res) => {
  try {
    const { deviceTokens, notification, data } = req.body;
    const { userId, appRole } = req.pushUser;

    console.log(`📢 Sending push notification to ${deviceTokens.length} devices`);

    // Send using the service
    const result = await pushNotificationService.sendToMultipleDevices(
      deviceTokens,
      notification,
      {
        ...data,
        sentBy: userId,
        role: appRole,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: `Push notification sent to ${result.totalSuccess} devices`,
      totalDevices: result.totalDevices,
      totalSuccess: result.totalSuccess,
      totalFailed: result.totalFailed,
      chunksProcessed: result.chunksProcessed,
      result
    });
  } catch (error) {
    console.error("sendToMultipleDevices:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send push notifications",
    });
  }
};

exports.broadcastToAll = async (req, res) => {
  try {
    const { notification, data, targetRole } = req.body;
    const { userId, appRole } = req.pushUser;

    console.log(`📢 Broadcasting to all ${targetRole || 'users'}`);

    // Find all active device tokens for the target role
    let query = { isActive: true };
    if (targetRole) {
      query.appRole = targetRole;
    }

    const deviceRecords = await DeviceToken.find(query);
    const deviceTokens = deviceRecords.map(record => record.token);

    if (deviceTokens.length === 0) {
      return res.json({
        success: true,
        message: `No active devices found for role: ${targetRole || 'all'}`,
        totalDevices: 0,
        totalSuccess: 0
      });
    }

    console.log(`📢 Broadcasting to ${deviceTokens.length} active devices`);

    // Send using the service
    const result = await pushNotificationService.sendToMultipleDevices(
      deviceTokens,
      notification,
      {
        ...data,
        broadcastType: 'global',
        broadcastedBy: userId,
        adminRole: appRole,
        targetRole: targetRole || 'all',
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      message: `Broadcast sent to ${result.totalSuccess} devices`,
      targetRole: targetRole || 'all',
      totalDevices: result.totalDevices,
      totalSuccess: result.totalSuccess,
      totalFailed: result.totalFailed,
      chunksProcessed: result.chunksProcessed,
      result
    });
  } catch (error) {
    console.error("broadcastToAll:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to broadcast notification",
    });
  }
};

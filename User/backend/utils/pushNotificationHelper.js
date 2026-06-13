const DeviceToken = require("../models/DeviceToken");
const { User } = require("../models");
const pushNotificationService = require("../services/pushNotificationService");

async function getActiveTokensForUser(userId) {
  const rows = await DeviceToken.find({
    userId,
    appRole: "user",
    isActive: true,
  }).select("token");
  return rows.map((r) => r.token).filter(Boolean);
}

async function userAllowsPush(userId, type = "general") {
  const user = await User.findById(userId).select("notificationPreferences");
  if (!user) return false;
  const prefs = user.notificationPreferences || {};
  if (prefs.push === false) return false;
  if (type === "order" && prefs.orderUpdates === false) return false;
  if (type === "payment" && prefs.paymentAlerts === false) return false;
  if (type === "delivery" && prefs.deliveryNotifications === false) return false;
  if (type === "promotion" && prefs.promotions === false) return false;
  return true;
}

async function sendPushToUser(userId, notification, data = {}, type = "general") {
  try {
    if (!(await userAllowsPush(userId, type))) {
      return { success: false, skipped: true, reason: "preferences" };
    }

    const tokens = await getActiveTokensForUser(userId);
    if (!tokens.length) {
      return { success: false, skipped: true, reason: "no_tokens" };
    }

    return await pushNotificationService.sendToMultipleDevices(
      tokens,
      notification,
      data,
    );
  } catch (error) {
    console.error("sendPushToUser error:", error.message);
    return { success: false, error: error.message };
  }
}

async function notifyOrderStatusChange(order, status) {
  if (!order?.userId) return null;
  const userId = order.userId._id || order.userId;
  const orderNumber = order.orderNumber || order._id?.toString()?.slice(-6);
  const customerName =
    order.customerName || order.shippingAddress?.name || "";

  const notification = pushNotificationService.generateOrderUpdateNotification(
    { _id: order._id, orderId: orderNumber, orderNumber },
    status,
    customerName,
  );

  return sendPushToUser(
    userId,
    notification,
    {
      type: "order_update",
      orderId: String(order._id),
      status,
    },
    "order",
  );
}

module.exports = {
  getActiveTokensForUser,
  userAllowsPush,
  sendPushToUser,
  notifyOrderStatusChange,
};

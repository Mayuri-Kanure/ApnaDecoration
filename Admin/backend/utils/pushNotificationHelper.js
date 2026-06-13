const DeviceToken = require("../models/DeviceToken");
const pushNotificationService = require("../services/pushNotificationService");

async function getActiveTokens(userId, appRole) {
  const rows = await DeviceToken.find({
    userId,
    appRole,
    isActive: true,
  }).select("token");
  return rows.map((r) => r.token).filter(Boolean);
}

async function sendPushToRecipient(
  userId,
  appRole,
  notification,
  data = {},
) {
  try {
    const tokens = await getActiveTokens(userId, appRole);
    if (!tokens.length) {
      return { success: false, skipped: true, reason: "no_tokens" };
    }
    return await pushNotificationService.sendToMultipleDevices(
      tokens,
      notification,
      data,
    );
  } catch (error) {
    console.error("sendPushToRecipient error:", error.message);
    return { success: false, error: error.message };
  }
}

async function notifyDeliveryBoy(deliveryBoyId, title, body, data = {}) {
  return sendPushToRecipient(
    deliveryBoyId,
    "delivery",
    { title, body },
    { type: "delivery", ...data },
  );
}

async function notifyVendor(vendorUserId, title, body, data = {}) {
  return sendPushToRecipient(
    vendorUserId,
    "vendor",
    { title, body },
    { type: "vendor", ...data },
  );
}

async function notifyAdminStaff(userId, title, body, data = {}) {
  return sendPushToRecipient(
    userId,
    "admin",
    { title, body },
    { type: "admin", ...data },
  );
}

module.exports = {
  getActiveTokens,
  sendPushToRecipient,
  notifyDeliveryBoy,
  notifyVendor,
  notifyAdminStaff,
};

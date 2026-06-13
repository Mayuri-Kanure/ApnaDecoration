const express = require("express");
const { body } = require("express-validator");
const { pushAuth } = require("../middleware/pushAuth");
const pushNotificationController = require("../controllers/pushNotificationController");
const {
  broadcastLimiter,
  sensitiveBroadcastLimiter,
  validateBroadcastPayload,
  auditBroadcast
} = require("../middleware/pushNotificationMiddleware");

const router = express.Router();

const deviceTokenValidation = body("deviceToken")
  .notEmpty()
  .isString()
  .isLength({ min: 20 });

router.post(
  "/register-device",
  pushAuth,
  deviceTokenValidation,
  pushNotificationController.registerDevice,
);

router.post("/unregister-device", pushAuth, pushNotificationController.unregisterDevice);

router.post("/test", pushAuth, pushNotificationController.sendTestToMe);

// Broadcast endpoints with rate limiting and validation
router.post(
  "/send-to-multiple-devices",
  pushAuth,
  broadcastLimiter, // Rate limit: 10 per minute
  validateBroadcastPayload, // Validate payload size and format
  auditBroadcast, // Log broadcast operations
  pushNotificationController.sendToMultipleDevices
);

router.post(
  "/broadcast",
  pushAuth,
  sensitiveBroadcastLimiter, // More restrictive: 3 per 5 minutes
  validateBroadcastPayload,
  auditBroadcast,
  pushNotificationController.broadcastToAll
);

module.exports = router;

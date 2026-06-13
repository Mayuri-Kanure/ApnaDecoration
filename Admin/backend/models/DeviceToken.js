const mongoose = require("mongoose");

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    appRole: {
      type: String,
      enum: ["user", "vendor", "delivery", "admin"],
      required: true,
      index: true,
    },
    token: { type: String, required: true, trim: true },
    platform: { type: String, default: "android" },
    platformVersion: String,
    deviceModel: String,
    appVersion: String,
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

deviceTokenSchema.index({ userId: 1, appRole: 1, token: 1 }, { unique: true });

module.exports = mongoose.model("DeviceToken", deviceTokenSchema);

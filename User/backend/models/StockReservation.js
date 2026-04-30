const mongoose = require("mongoose");

const stockReservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        productModel: {
          type: String,
          enum: ["Product", "VendorProduct"],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    reservationToken: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["reserved", "confirmed", "released", "expired"],
      default: "reserved",
    },
    // Expiry: 10 minutes from reservation
    expiresAt: {
      type: Date,
      required: true,
    },
    // When was it confirmed into actual order
    confirmedAt: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
    // Link to order if confirmed
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// ====== INDEXES ======
stockReservationSchema.index({ user: 1, status: 1 });
stockReservationSchema.index({ reservationToken: 1 });
stockReservationSchema.index({ expiresAt: 1 }); // For cleanup jobs
stockReservationSchema.index({ status: 1, createdAt: 1 }); // For queries

// ====== TTL INDEX ======
// Automatically delete expired reservations after 30 minutes
stockReservationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 1800 }, // 30 minutes
);

module.exports = mongoose.model("StockReservation", stockReservationSchema);

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,

    ref: "Product", // Add reference to Product model

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

  unitPrice: {
    type: Number,

    required: true,

    min: 0,
  },

  totalPrice: {
    type: Number,

    required: true,

    min: 0,
  },

  specifications: {
    size: String,

    paper: String,

    finish: String,

    colors: String,

    customNotes: String,
  },

  files: [
    {
      filename: String,

      url: String,

      uploadDate: { type: Date, default: Date.now },
    },
  ],

  productSnapshot: {
    name: String,
    thumbnail: String,
    price: Number,
    sku: String,
    description: String,
    images: [String],
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,

      required: true,

      unique: true,
    },

    type: {
      type: String,

      enum: ["product", "service"],

      default: "product",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    // Service booking fields

    service: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Service",
    },

    serviceName: String,

    servicePrice: Number,

    serviceDuration: String,

    serviceImage: String,

    bookingDate: Date,

    bookingTime: String,

    notes: String,

    customerInfo: {
      name: String,

      email: String,

      phone: String,

      address: String,

      specialRequests: String,
    },

    // Reference image upload

    referenceImage: {
      type: String,

      default: null,
    },

    // Product order fields

    items: [orderItemSchema],

    pricing: {
      subtotal: { type: Number, min: 0 },

      tax: { type: Number, default: 0 },

      shipping: { type: Number, default: 0 },

      discount: { type: Number, default: 0 },

      total: { type: Number, required: true, min: 0 },
    },

    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "out-for-delivery",
        "delivered",
        "returned",
        "cancelled",
        "failed",
      ],

      default: "pending",
    },

    paymentStatus: {
      type: String,

      enum: ["pending", "paid", "failed", "refunded"],

      default: "pending",
    },

    paymentMethod: {
      type: String,

      enum: ["razorpay", "cod", "bank_transfer"],

      default: "razorpay",
    },

    paymentDetails: {
      razorpay_order_id: String,

      razorpay_payment_id: String,

      razorpay_signature: String,

      amount: Number,

      currency: String,

      status: String,

      captured_at: Date,
    },

    refundDetails: {
      refund_id: String,

      amount: Number,

      status: String,

      reason: String,

      created_at: Date,
    },

    shippingAddress: {
      street: String,

      city: String,

      state: String,

      zipCode: String,

      country: String,
    },

    billingAddress: {
      street: String,

      city: String,

      state: String,

      zipCode: String,

      country: String,
    },

    notes: {
      customer: String,

      internal: String,
    },

    timeline: [
      {
        status: String,

        timestamp: { type: Date, default: Date.now },

        note: String,

        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,

          ref: "User",
        },
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    estimatedDelivery: Date,

    actualDelivery: Date,

    priority: {
      type: String,

      enum: ["low", "normal", "high", "urgent"],

      default: "normal",
    },
  },
  {
    timestamps: true,
  },
);

// Temporarily disable pre-save hook to fix order creation
// orderSchema.pre('save', async function(next) {
//   try {
//     if (this.isNew && !this.orderNumber) {
//       this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Indexes (orderNumber already indexed by unique: true)

orderSchema.index({ customer: 1 });

orderSchema.index({ status: 1 });

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

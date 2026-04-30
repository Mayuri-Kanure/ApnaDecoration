const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Unified fields for both Admin and User
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Admin compatibility field
    product_name_en: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Admin compatibility field
    description_en: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Admin compatibility field
    category_id: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    // Admin specific fields
    product_type: {
      type: String,
      default: "general",
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // SEO fields
    video_link: {
      type: String,
    },
    meta_title: {
      type: String,
    },
    meta_description: {
      type: String,
    },
    indexing_option: {
      type: String,
      default: "index",
    },
    max_snippet: {
      type: String,
      default: "-1",
    },
    max_video_preview: {
      type: String,
      default: "-1",
    },
    max_image_preview: {
      type: String,
      default: "large",
    },
    // Order management fields
    min_order_qty: {
      type: Number,
      default: 1,
    },
    max_order_qty: {
      type: Number,
    },
    // Pricing fields
    discount_type: {
      type: String,
      default: "flat",
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    tax_percent: {
      type: Number,
      default: 0,
    },
    tax_calculation: {
      type: String,
      default: "include",
    },
    shipping_cost: {
      type: Number,
      default: 0,
    },
    shipping_multiply_quantity: {
      type: Boolean,
      default: false,
    },
    // Product variations and color options
    color_wise_images: {
      type: Map,
      of: String,
    },
    has_variations: {
      type: Boolean,
      default: false,
    },
    variations: [
      {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    ],
    // Clearance sale fields
    isClearance: {
      type: Boolean,
      default: false,
    },
    clearanceDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    clearanceExpiry: {
      type: Date,
    },
    clearanceOriginalPrice: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual to ensure name field is populated from product_name_en if needed
productSchema.pre("save", function (next) {
  if (!this.name && this.product_name_en) {
    this.name = this.product_name_en;
  }
  if (!this.description && this.description_en) {
    this.description = this.description_en;
  }
  if (!this.sku) {
    this.sku =
      "PRD-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  // Sync featured and is_featured fields
  if (this.featured !== undefined) {
    this.is_featured = this.featured;
  } else if (this.is_featured !== undefined) {
    this.featured = this.is_featured;
  }
  next();
});

// Index for search
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  product_name_en: "text",
  description_en: "text",
});

module.exports = mongoose.model("Product", productSchema);

// Shared Banner Model - Same as Admin backend
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false, // Made optional since admin uses bannerType
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: false, // Made optional since some banners might not have images initially
    },
    bannerType: {
      type: String,
      enum: [
        "Main Banner",
        "Footer Banner",
        "Promo Banner",
        "hero",
        "promotion",
        "announcement",
        "category",
      ],
      default: "Main Banner",
    },
    bannerUrl: {
      type: String,
    },
    resourceType: {
      type: String,
      enum: ["product", "category", "url"],
      default: "",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    aspectRatio: {
      type: String,
      default: "16/6",
    },
    published: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for flexibility
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Banner", bannerSchema);

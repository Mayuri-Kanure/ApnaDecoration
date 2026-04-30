const express = require("express");
const { Banner } = require("../models");
const { authMiddleware, authorize } = require("../middleware/auth");
const cloudinaryService = require("../services/cloudinaryService");
const router = express.Router();

// Configure Cloudinary storage for banners
const upload = cloudinaryService.uploadBannerImages();

// Get public banners
router.get("/public", async (req, res) => {
  try {
    console.log("=== GET PUBLIC BANNERS API CALLED ===");

    // Fetch banners from the database - more flexible query
    const banners = await Banner.find({
      $or: [
        { published: true },
        { published: "true" },
        { published: 1 },
        { published: { $exists: false } }, // Include banners without published field
        { status: "active" },
        { status: { $exists: false } }, // Include banners without status field
      ],
    }).sort({ priority: -1, createdAt: -1 });

    console.log("Raw banners from database:", banners);

    // Check if banners are found
    if (!banners || banners.length === 0) {
      console.warn("No banners found in the database");
      res.json({
        success: true,
        banners: [],
      });
      return;
    }

    // Process banners
    const processedBanners = banners.map((banner) => {
      const bannerObj = banner.toObject();
      console.log("Processing banner:", bannerObj);

      // Ensure the banner has required fields for frontend
      return {
        ...bannerObj,
        published: bannerObj.published !== false, // Default to true if not explicitly false
        bannerType: bannerObj.bannerType || bannerObj.title || "Banner",
        title: bannerObj.title || bannerObj.bannerType || "Banner",
        bannerUrl: bannerObj.bannerUrl || bannerObj.image,
        image: bannerObj.image || bannerObj.bannerUrl,
      };
    });

    console.log("Processed banners:", processedBanners);

    res.json({
      success: true,
      banners: processedBanners,
    });
  } catch (error) {
    console.error("Error fetching public banners:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
  }
});

// Get all banners (admin)
router.get(
  "/",
  authMiddleware,
  authorize(["admin", "manager"]),
  async (req, res) => {
    try {
      const banners = await Banner.find().sort({ priority: -1, createdAt: -1 });

      res.json({
        success: true,
        banners: banners,
      });
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch banners",
      });
    }
  },
);

// Create banner (admin)
router.post(
  "/",
  authMiddleware,
  authorize(["admin", "manager"]),
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("📤 Banner upload request received");
      console.log("📤 File:", req.file);
      console.log("📤 Body:", req.body);

      const bannerData = {
        ...req.body,
        createdBy: req.user?.userId || req.user?._id || null,
      };

      // Add image path if file was uploaded
      if (req.file) {
        if (req.file.path && req.file.path.includes("cloudinary")) {
          // Cloudinary URL
          bannerData.image = req.file.path;
          console.log("✅ Image saved to Cloudinary:", bannerData.image);
        } else {
          // Local storage path
          bannerData.image = `/uploads/banners/${req.file.filename}`;
          console.log("✅ Image saved locally:", bannerData.image);
        }
      }

      const banner = new Banner(bannerData);
      await banner.save();

      console.log("✅ Banner created successfully:", banner._id);

      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        banner: banner,
      });
    } catch (error) {
      console.error("❌ Error creating banner:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create banner",
        error: error.message,
      });
    }
  },
);

// Update banner (admin)
router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "manager"]),
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("📤 Banner update request received for ID:", req.params.id);
      console.log("📤 File:", req.file);
      console.log("📤 Body:", req.body);

      const updateData = { ...req.body };

      // Add image path if file was uploaded
      if (req.file) {
        if (req.file.path && req.file.path.includes("cloudinary")) {
          // Cloudinary URL
          updateData.image = req.file.path;
          console.log("✅ New image saved to Cloudinary:", updateData.image);
        } else {
          // Local storage path
          updateData.image = `/uploads/banners/${req.file.filename}`;
          console.log("✅ New image saved locally:", updateData.image);
        }
      }

      const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      console.log("✅ Banner updated successfully:", banner._id);

      res.json({
        success: true,
        message: "Banner updated successfully",
        banner: banner,
      });
    } catch (error) {
      console.error("❌ Error updating banner:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update banner",
        error: error.message,
      });
    }
  },
);

// Delete banner (admin)
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "manager"]),
  async (req, res) => {
    try {
      const banner = await Banner.findByIdAndDelete(req.params.id);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Banner not found",
        });
      }

      res.json({
        success: true,
        message: "Banner deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete banner",
      });
    }
  },
);

module.exports = router;

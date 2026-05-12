const express = require("express");
const router = express.Router();
const ServiceCategory = require("../models").ServiceCategory;

// Get home page service categories - Query database directly
router.get("/home-page-service-categories", async (req, res) => {
  try {
    const { homeCategory, status } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (homeCategory !== undefined)
      filter.homeCategory = homeCategory === "true";

    const categories = await ServiceCategory.find(filter).sort({
      priority: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(
      "Error fetching home page service categories:",
      error.message,
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
      error: error.message,
    });
  }
});

// Get public service categories - Query database directly
router.get("/public", async (req, res) => {
  try {
    const { homeCategory, status } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (homeCategory !== undefined)
      filter.homeCategory = homeCategory === "true";

    const categories = await ServiceCategory.find(filter).sort({
      priority: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching service categories:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
      error: error.message,
    });
  }
});

// Get all service categories - Query database directly
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, homeCategory } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (homeCategory !== undefined)
      filter.homeCategory = homeCategory === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await ServiceCategory.find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceCategory.countDocuments(filter);

    res.json({
      success: true,
      data: categories,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching service categories:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
      error: error.message,
    });
  }
});

module.exports = router;

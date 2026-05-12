const express = require("express");
const router = express.Router();
const Product = require("../models").Product;

// Get clearance sale products - query database directly
router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build filter for clearance products (products with clearance-related tags)
    const filter = {
      status: "active",
      stock: { $gt: 0 },
      $or: [
        { tags: { $in: ["clearance", "sale", "discount", "offer"] } },
        { name: { $regex: /clearance|sale|discount|offer/i } },
      ],
    };

    if (search) {
      filter.$and = [
        filter.$or ? { $or: filter.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("category", "name");

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching clearance products:", error.message);
    res.json({ success: true, data: [] });
  }
});

// Get public clearance sale info - query database directly
router.get("/public", async (req, res) => {
  try {
    // Get clearance products count
    const clearanceFilter = {
      status: "active",
      stock: { $gt: 0 },
      $or: [
        { tags: { $in: ["clearance", "sale", "discount", "offer"] } },
        { name: { $regex: /clearance|sale|discount|offer/i } },
      ],
    };

    const clearanceCount = await Product.countDocuments(clearanceFilter);

    // Get a few sample clearance products
    const sampleProducts = await Product.find(clearanceFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name")
      .select("name price thumbnail images category");

    res.json({
      success: true,
      data: {
        title: "Clearance Sale",
        description: "Special offers and discounts on selected items",
        products: sampleProducts,
        totalProducts: clearanceCount,
        discount: clearanceCount > 0 ? 20 : 0, // Default 20% discount if products exist
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: clearanceCount > 0,
      },
    });
  } catch (error) {
    console.error("Error fetching clearance sale info:", error.message);
    // Return a default empty response instead of propagating the error
    res.json({
      success: true,
      data: {
        title: "Clearance Sale",
        description: "Special offers and discounts",
        products: [],
        totalProducts: 0,
        discount: 0,
        endDate: null,
        isActive: false,
      },
    });
  }
});

module.exports = router;

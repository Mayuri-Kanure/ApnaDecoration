const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Inhouse Sales
router.get("/inhouse-sales", async (req, res) => {
  try {
    const orders = await Order.find({
      store: "inhouse", // adjust based on your schema
      status: { $ne: "cancelled" }    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error("Inhouse sales error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inhouse sales"
    });
  }
});

module.exports = router;

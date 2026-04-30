const express = require("express");
const axios = require("axios");
const router = express.Router();

const ADMIN_API =
  process.env.ADMIN_API_URL || "https://admin-api.apnadecoration.com/api";

// Get clearance sale products - proxy to Admin backend
router.get("/products", async (req, res) => {
  try {
    const response = await axios.get(`${ADMIN_API}/clearance-sale/products`, {
      params: req.query,
      timeout: 10000,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching clearance products:", error.message);
    res.json({ success: true, data: [] });
  }
});

// Get public clearance sale info - proxy to Admin backend
router.get("/public", async (req, res) => {
  try {
    const response = await axios.get(`${ADMIN_API}/clearance-sale/public`, {
      timeout: 10000,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching clearance sale info:", error.message);
    // Return a default empty response instead of propagating the error
    res.json({
      success: true,
      data: {
        title: "Clearance Sale",
        description: "Special offers and discounts",
        products: [],
        discount: 0,
        endDate: null,
      },
    });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const router = express.Router();

const ADMIN_API = "https://admin-api.apnadecoration.com/api";

// Get home page service categories - Fetch from Admin backend
router.get("/home-page-service-categories", async (req, res) => {
  try {
    const { homeCategory, status } = req.query;

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/service-categories`, {
      params: { homeCategory, status },
    });

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || [],
    });
  } catch (error) {
    console.error(
      "Error fetching home page service categories:",
      error.message,
    );
    // Provide fallback empty array instead of 500 error
    res.json({
      success: true,
      data: [],
    });
  }
});

// Get public service categories - Fetch from Admin backend
router.get("/public", async (req, res) => {
  try {
    const { homeCategory, status } = req.query;

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/service-categories`, {
      params: { homeCategory, status },
    });

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || [],
    });
  } catch (error) {
    console.error("Error fetching service categories:", error.message);
    // Provide fallback empty array instead of 500 error
    res.json({
      success: true,
      data: [],
    });
  }
});

// Get all service categories - Fetch from Admin backend with fallback
router.get("/", async (req, res) => {
  try {
    const { homeCategory, status } = req.query;

    // Try Admin backend first
    const response = await axios.get(`${ADMIN_API}/service-categories/public`, {
      params: { homeCategory, status },
    });

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.categories || [],
    });
  } catch (error) {
    console.error("Error fetching service categories:", error.message);
    // Provide fallback empty array instead of 500 error
    res.json({
      success: true,
      data: [],
    });
  }
});

module.exports = router;

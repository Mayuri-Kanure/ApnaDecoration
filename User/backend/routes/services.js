const express = require("express");
const axios = require("axios");
const router = express.Router();

const ADMIN_API =
  process.env.ADMIN_API_URL || "https://admin-api.apnadecoration.com";

// Get services - Main route with fallback
router.get("/", async (req, res) => {
  try {
    const { category, featured, status } = req.query;
    console.log("Fetching services with query:", {
      category,
      featured,
      status,
    });

    // Try Admin backend first
    const response = await axios.get(`${ADMIN_API}/api/services`, {
      params: { category, featured, status },
      timeout: 5000,
    });

    console.log("Response from Admin backend:", response.data);

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.services || [],
    });
  } catch (error) {
    console.error("Error fetching services from Admin backend:", error.message);

    // Fallback to empty array
    console.log("Falling back to empty services array");
    res.json({
      success: true,
      data: [],
    });
  }
});

// Get service by ID with fallback
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching service with ID:", id);

    // Try Admin backend first
    const response = await axios.get(`${ADMIN_API}/api/services/${id}`, {
      timeout: 5000,
    });

    console.log("Response from Admin backend:", response.data);

    res.json({
      success: true,
      data: response.data.data || response.data,
    });
  } catch (error) {
    console.error("Error fetching service from Admin backend:", error.message);

    // Fallback to 404
    res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }
});

// Get public services - Fetch from Admin backend
router.get("/public", async (req, res) => {
  try {
    const { category, featured, status } = req.query;
    console.log("Fetching public services with query:", {
      category,
      featured,
      status,
    });

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services/public`, {
      params: { category, featured, status },
    });

    console.log("Response from Admin backend:", response.data);

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.services || [],
    });
  } catch (error) {
    console.error(
      "Error fetching public services:",
      error.message,
      error.response?.data,
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch public services",
      error: error.message,
    });
  }
});

// Get featured services - Fetch from Admin backend
router.get("/featured", async (req, res) => {
  try {
    console.log("Fetching featured services");

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services`, {
      params: { featured: true },
    });

    console.log("Response from Admin backend:", response.data);

    res.json({
      success: true,
      services: response.data.data || response.data.services || [],
    });
  } catch (error) {
    console.error(
      "Error fetching featured services:",
      error.message,
      error.response?.data,
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured services",
      error: error.message,
    });
  }
});

// Create service (admin) - Proxy to Admin backend
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(`${ADMIN_API}/api/services`, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        "Content-Type": "application/json",
      },
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to create service",
    });
  }
});

// Update service (admin) - Proxy to Admin backend
router.put("/:id", async (req, res) => {
  try {
    const response = await axios.put(
      `${ADMIN_API}/api/services/${req.params.id}`,
      req.body,
      {
        headers: {
          Authorization: req.headers.authorization,
          "Content-Type": "application/json",
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to update service",
    });
  }
});

// Delete service (admin) - Proxy to Admin backend
router.delete("/:id", async (req, res) => {
  try {
    const response = await axios.delete(
      `${ADMIN_API}/api/services/${req.params.id}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to delete service",
    });
  }
});

module.exports = router;

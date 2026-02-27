const express = require('express');
const axios = require('axios');
const router = express.Router();

const ADMIN_API = process.env.ADMIN_API_URL || 'http://localhost:5000';

// Create booking - Proxy to Admin backend
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${ADMIN_API}/api/bookings`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create booking'
    });
  }
});

module.exports = router;

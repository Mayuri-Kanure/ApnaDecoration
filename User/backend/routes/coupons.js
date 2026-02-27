const express = require('express');
const axios = require('axios');
const router = express.Router();

const ADMIN_API = process.env.ADMIN_API_URL || 'http://localhost:5000';

console.log('✅ Coupon routes loaded');

// Get available coupons (public)
router.get('/available', async (req, res) => {
  console.log('🎫 Fetching available coupons');
  try {
    const response = await axios.get(`${ADMIN_API}/api/coupons/available`);
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch coupons:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch coupons'
    });
  }
});

// Validate coupon (public)
router.post('/validate', async (req, res) => {
  console.log('🎫 Coupon validate route hit:', req.body);
  try {
    console.log('Proxying to:', `${ADMIN_API}/api/coupons/validate`);
    const response = await axios.post(`${ADMIN_API}/api/coupons/validate`, req.body);
    console.log('Response from admin:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Coupon validation error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to validate coupon'
    });
  }
});

module.exports = router;

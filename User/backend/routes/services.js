const express = require('express');
const axios = require('axios');
const router = express.Router();

const ADMIN_API = process.env.ADMIN_API_URL || 'https://admin-api.apnadecoration.com';

// Get public services - Fetch from Admin backend
router.get('/public', async (req, res) => {
  try {
    const { category, featured, status } = req.query;
    console.log('Fetching public services with query:', { category, featured, status });

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services/public`, {
      params: { category, featured, status }
    });

    console.log('Response from Admin backend:', response.data);

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.services || []
    });
  } catch (error) {
    console.error('Error fetching public services:', error.message, error.response?.data);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public services',
      error: error.message
    });
  }
});

// Get all services - Fetch from Admin backend
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all services');

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services`);

    console.log('Response from Admin backend:', response.data);

    // Transform response to match expected format
    res.json({
      success: true,
      data: response.data.data || response.data.services || []
    });
  } catch (error) {
    console.error('Error fetching all services:', error.message, error.response?.data);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all services',
      error: error.message
    });
  }
});

// Get featured services - Fetch from Admin backend
router.get('/featured', async (req, res) => {
  try {
    console.log('Fetching featured services');

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services`, {
      params: { featured: true }
    });

    console.log('Response from Admin backend:', response.data);

    res.json({
      success: true,
      services: response.data.data || response.data.services || []
    });
  } catch (error) {
    console.error('Error fetching featured services:', error.message, error.response?.data);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured services',
      error: error.message
    });
  }
});

// Get service by ID - Fetch from Admin backend
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching service by ID:', req.params.id);

    // Fetch from Admin backend
    const response = await axios.get(`${ADMIN_API}/api/services/${req.params.id}`);

    console.log('Response from Admin backend:', response.data);

    res.json({
      success: true,
      data: response.data.data || response.data.service || response.data
    });
  } catch (error) {
    console.error('Error fetching service:', error.message, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch service',
      error: error.message
    });
  }
});

// Create service (admin) - Proxy to Admin backend
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${ADMIN_API}/api/services`, req.body, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create service'
    });
  }
});

// Update service (admin) - Proxy to Admin backend
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${ADMIN_API}/api/services/${req.params.id}`, req.body, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to update service'
    });
  }
});

// Delete service (admin) - Proxy to Admin backend
router.delete('/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${ADMIN_API}/api/services/${req.params.id}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to delete service'
    });
  }
});

module.exports = router;

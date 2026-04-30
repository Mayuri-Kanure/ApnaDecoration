const express = require('express');
const ServiceCategory = require('./models/ServiceCategory');

// Create a simple test endpoint
const app = express();
app.use(express.json());

// Test endpoint to get public service categories
app.get('/api/service-categories/public', async (req, res) => {
  try {
    const { homeCategory, status } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (homeCategory !== undefined) filter.homeCategory = homeCategory === 'true';
    
    const categories = await ServiceCategory.find(filter)
      .sort({ priority: 1, order: 1, createdAt: -1 });
    
    console.log(`📊 Found ${categories.length} service categories with filter:`, filter);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test the endpoint
const testEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/service-categories/public?homeCategory=true&status=active');
    const data = await response.json();
    console.log('✅ Test Response:', data);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
};

// Start server on port 5001 (Admin backend usually runs on 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Testing endpoint: http://localhost:${PORT}/api/service-categories/public`);
  
  // Test after server starts
  setTimeout(testEndpoint, 1000);
});

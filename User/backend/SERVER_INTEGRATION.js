// 📦 ADD THIS TO YOUR server.js FILE
// Location: User/backend/server.js

const express = require('express');
const connectDB = require('./config/database');
const inventoryMonitor = require('./services/inventoryMonitor'); // ← ADD THIS

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());

// Routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// ============================================
// 📦 INVENTORY MONITORING SETUP
// ============================================
// Add this block after your server starts listening

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // 🚀 START INVENTORY MONITORING
    // ================================
    inventoryMonitor.startMonitoring();
    console.log('📦 Inventory monitoring activated');
    console.log('   ⏰ Scheduled: 6 AM IST daily');
    console.log('   📧 Email alerts: Enabled');
    console.log('   📊 Dashboard: /api/admin/inventory/status');
    // ================================

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('');
      console.log('📋 INVENTORY ENDPOINTS AVAILABLE:');
      console.log('   GET  /api/admin/inventory/status');
      console.log('   GET  /api/admin/inventory/low-stock');
      console.log('   POST /api/admin/inventory/scan-now');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

// ============================================
// OPTIONAL: Manual scanning trigger
// ============================================
// You can also call this from any controller or route:
/*
const inventoryMonitor = require('./services/inventoryMonitor');

// Run immediately
await inventoryMonitor.runNow();

// Or in a route:
app.post('/manual-inventory-check', async (req, res) => {
  const results = await inventoryMonitor.runNow();
  res.json({
    success: true,
    message: `Found ${results.length} low stock items`,
    results
  });
});
*/

// ============================================
// OPTIONAL: Graceful shutdown
// ============================================
process.on('SIGINT', () => {
  console.log('\n⏹️ Stopping server...');
  inventoryMonitor.stopMonitoring();
  process.exit(0);
});

module.exports = app;

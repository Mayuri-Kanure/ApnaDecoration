const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use the same database as Admin backend
    const mongoURI = process.env.MONGODB_URI;

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize inventory jobs after successful connection
    try {
      // Basic cleanup job
      const InventoryCleanupJob = require("../services/inventoryCleanupJob");
      InventoryCleanupJob.initializeCleanupJob();
      console.log("✅ Inventory cleanup job initialized");

      // Stock sanity check job
      const StockSanityJob = require("../services/stockSanityJob");
      StockSanityJob.initializeSanityJob();
      console.log("✅ Stock sanity job initialized");

      // Real-time monitoring
      const StockMonitoringService = require("../services/stockMonitoringService");
      StockMonitoringService.initializeMonitoring();
      console.log("✅ Stock monitoring service initialized");
    } catch (jobError) {
      console.error(
        "⚠️ Failed to initialize inventory jobs:",
        jobError.message,
      );
      // Don't exit the server, just log the error
    }

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;

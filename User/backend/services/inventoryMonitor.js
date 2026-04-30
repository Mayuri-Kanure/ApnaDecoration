const lowStockService = require('./lowStockService');
const { CronJob } = require('cron');

class InventoryMonitor {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  // Start the daily monitoring job
  startMonitoring() {
    try {
      // Run every day at 6 AM IST
      this.job = new CronJob('0 6 * * *', async () => {
        console.log('⏰ Running daily low stock scan...');
        await lowStockService.scanAndAlertLowStock();
      });

      this.job.start();
      this.isRunning = true;
      console.log('✅ Inventory monitoring started (Daily at 6 AM IST)');
    } catch (err) {
      console.error('❌ Failed to start monitoring:', err.message);
    }
  }

  // Stop the monitoring job
  stopMonitoring() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('⏹️ Inventory monitoring stopped');
    }
  }

  // Run scan immediately (manual trigger)
  async runNow() {
    console.log('🚀 Running immediate low stock scan...');
    return await lowStockService.scanAndAlertLowStock();
  }

  // Get current inventory status
  async getStatus() {
    return await lowStockService.getInventoryStatus();
  }
}

module.exports = new InventoryMonitor();

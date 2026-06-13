const cron = require('node-cron');
const DeviceToken = require('../models/DeviceToken');

/**
 * Device Token Cleanup Scheduler
 * 
 * Implements automated, proactive cleanup of stale device tokens to:
 * - Prevent MongoDB collection bloat
 * - Improve batch notification performance
 * - Reduce FCM error rates from invalid tokens
 * - Free up database resources
 * 
 * Task: Runs every day at midnight (00:00)
 * Action: Deletes tokens not updated in the last 90 days
 */

class DeviceTokenCleanupScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
    this.lastCleanupTime = null;
    this.cleanupStats = {
      deletedCount: 0,
      averageAge: 0,
      lastRun: null
    };
  }

  /**
   * Start the scheduled cleanup job
   * Runs every day at 00:00 (midnight)
   * 
   * Cron format: minute hour day month day-of-week
   * '0 0 * * *' = 00:00 (midnight) every day
   */
  start() {
    if (this.isRunning) {
      console.warn('⚠️ Device Token Cleanup Scheduler already running');
      return;
    }

    try {
      // Schedule for midnight every day
      this.scheduledTask = cron.schedule('0 0 * * *', async () => {
        console.log('🌙 Starting scheduled device token cleanup...');
        await this.performCleanup();
      });

      this.isRunning = true;
      console.log('✅ Device Token Cleanup Scheduler started (runs daily at midnight)');

      // Also run a cleanup 5 seconds after startup for any overnight accumulation
      setTimeout(() => {
        this.performCleanup();
      }, 5000);

    } catch (error) {
      console.error('❌ Error starting Device Token Cleanup Scheduler:', error.message);
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger cleanup (useful for admin/testing)
   */
  async manualCleanup() {
    console.log('🧹 Manual cleanup triggered');
    return await this.performCleanup();
  }

  /**
   * Core cleanup logic - removes stale tokens
   */
  async performCleanup() {
    try {
      const startTime = Date.now();
      this.lastCleanupTime = new Date();

      // Calculate date from 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Find tokens that will be deleted (for stats)
      const staleTokens = await DeviceToken.find({ 
        updatedAt: { $lt: ninetyDaysAgo } 
      }).select('_id updatedAt');

      if (staleTokens.length === 0) {
        console.log('✅ Cleanup complete: No stale tokens found (< 90 days old)');
        this.cleanupStats.lastRun = this.lastCleanupTime;
        this.cleanupStats.deletedCount = 0;
        return { deletedCount: 0, message: 'No stale tokens found' };
      }

      // Calculate average age of stale tokens
      const now = new Date().getTime();
      const totalAge = staleTokens.reduce((sum, token) => {
        return sum + (now - token.updatedAt.getTime());
      }, 0);
      const averageAgeMs = totalAge / staleTokens.length;
      const averageAgeDays = Math.floor(averageAgeMs / (1000 * 60 * 60 * 24));

      // Delete the stale tokens
      const result = await DeviceToken.deleteMany({ 
        updatedAt: { $lt: ninetyDaysAgo } 
      });

      const duration = Date.now() - startTime;

      // Update stats
      this.cleanupStats.deletedCount = result.deletedCount;
      this.cleanupStats.averageAge = averageAgeDays;
      this.cleanupStats.lastRun = this.lastCleanupTime;

      console.log(`🧹 ✅ Device Token Cleanup successful:`);
      console.log(`   📊 Deleted: ${result.deletedCount} tokens`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
      console.log(`   📈 Average age of deleted tokens: ${averageAgeDays} days`);

      return {
        success: true,
        deletedCount: result.deletedCount,
        averageAge: averageAgeDays,
        duration
      };

    } catch (error) {
      console.error('❌ Error during device token cleanup:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stop the scheduled cleanup job
   */
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.isRunning = false;
      console.log('⏹️ Device Token Cleanup Scheduler stopped');
    }
  }

  /**
   * Get cleanup statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      lastCleanupTime: this.lastCleanupTime,
      stats: this.cleanupStats
    };
  }

  /**
   * Force cleanup on application startup
   * Useful to clean up any tokens accumulated during downtime
   */
  async startupCleanup() {
    console.log('🚀 Running startup device token cleanup...');
    return await this.performCleanup();
  }
}

// Export singleton instance
module.exports = new DeviceTokenCleanupScheduler();

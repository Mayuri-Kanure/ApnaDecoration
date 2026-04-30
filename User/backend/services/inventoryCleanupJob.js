const cron = require("node-cron");
const InventoryService = require("./inventoryService");

/**
 * INVENTORY CLEANUP JOB
 * Runs every 5 minutes to clean up expired stock reservations
 * Also cleans up very old confirmed/released records
 */

class InventoryCleanupJob {
  static initializeCleanupJob() {
    console.log(
      "⏰ Initializing inventory cleanup job (runs every 5 minutes)...",
    );

    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      console.log(
        "🔄 Running inventory cleanup job at",
        new Date().toISOString(),
      );
      await this.cleanupExpiredReservations();
    });

    // Run detailed cleanup every hour
    cron.schedule("0 * * * *", async () => {
      console.log("🔄 Running hourly detailed cleanup...");
      await this.cleanupOldRecords();
    });

    console.log("✅ Inventory cleanup job initialized");
  }

  /**
   * Clean expired reservations (called every 5 minutes)
   */
  static async cleanupExpiredReservations() {
    try {
      const result = await InventoryService.cleanupExpiredReservations();

      if (result.success) {
        console.log(
          `✅ Cleanup successful: Released ${result.cleaned} expired reservations`,
        );
      } else {
        console.error("❌ Cleanup failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Cleanup job error:", error.message);
    }
  }

  /**
   * Clean old confirmed/released records (keep only last 30 days)
   */
  static async cleanupOldRecords() {
    try {
      const { StockReservation } = require("./models");

      // Delete records older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await StockReservation.deleteMany({
        status: { $in: ["confirmed", "released"] },
        createdAt: { $lt: thirtyDaysAgo },
      });

      console.log(
        `✅ Cleaned up ${result.deletedCount} old reservation records`,
      );
    } catch (error) {
      console.error("❌ Old records cleanup error:", error.message);
    }
  }
}

module.exports = InventoryCleanupJob;

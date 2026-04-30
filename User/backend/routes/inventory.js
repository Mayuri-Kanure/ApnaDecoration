const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  validateStockAvailability,
  validateQuantity,
  validateProductExists,
  validateReservationToken,
} = require("../middlewares/stockValidation");
const InventoryService = require("../services/inventoryService");

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

/**
 * ====== STOCK RESERVATION ENDPOINTS ======
 */

/**
 * POST /inventory/reserve
 * Reserve stock for a set of items (10-minute window)
 *
 * Body: {
 *   items: [
 *     { product: "id", productModel: "Product", quantity: 2 },
 *     { product: "id", productModel: "VendorProduct", quantity: 1 }
 *   ]
 * }
 *
 * Response: { reservationToken, expiresAt }
 */
router.post(
  "/reserve",
  validateQuantity,
  validateProductExists,
  validateStockAvailability,
  async (req, res) => {
    try {
      const userId = req.user.userId || req.user._id;
      const items = req.body.items;

      const result = await InventoryService.reserveStock(userId, items);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("❌ Reserve stock error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reserve stock",
        details: error.message,
      });
    }
  },
);

/**
 * POST /inventory/confirm
 * Confirm reservation & deduct stock (called after payment success)
 *
 * Body: {
 *   reservationToken: "RSV_xxx_xxx",
 *   orderId: "order_id"
 * }
 *
 * Response: { success: true }
 */
router.post("/confirm", validateReservationToken, async (req, res) => {
  try {
    const { reservationToken, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    const result = await InventoryService.confirmOrder(
      reservationToken,
      orderId,
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Confirm order error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm order",
      details: error.message,
    });
  }
});

/**
 * POST /inventory/release
 * Release reserved stock (user abandoned checkout or payment failed)
 *
 * Body: {
 *   reservationToken: "RSV_xxx_xxx"
 * }
 *
 * Response: { success: true }
 */
router.post("/release", validateReservationToken, async (req, res) => {
  try {
    const { reservationToken } = req.body;

    const result = await InventoryService.releaseStock(reservationToken);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Release stock error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to release stock",
      details: error.message,
    });
  }
});

/**
 * POST /inventory/check-availability
 * Check if product has stock available
 *
 * Body: {
 *   items: [
 *     { product: "id", productModel: "Product", quantity: 2 }
 *   ]
 * }
 *
 * Response: { allAvailable: true, validations: [...] }
 */
router.post("/check-availability", async (req, res) => {
  try {
    const items = req.body.items || [];

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No items to check",
      });
    }

    const result = await InventoryService.validateBatchAvailability(items);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Check availability error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check availability",
      details: error.message,
    });
  }
});

/**
 * GET /inventory/status/:productId
 * Check available stock for single product
 */
router.get("/status/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const productModel = req.query.model || "Product";

    const result = await InventoryService.checkAvailability(
      productId,
      productModel,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get stock status",
      details: error.message,
    });
  }
});

/**
 * ====== ADMIN ENDPOINTS (Inventory Management) ======
 */

/**
 * GET /inventory/admin/status
 * Admin dashboard - inventory overview
 * Requires admin role
 */
router.get("/admin/status", async (req, res) => {
  try {
    // Check if user is admin (implement based on your user model)
    // const isAdmin = req.user.role === 'admin';
    // if (!isAdmin) return res.status(403).json({ error: 'Unauthorized' });

    const status = await InventoryService.getInventoryStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("❌ Admin status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get inventory status",
      details: error.message,
    });
  }
});

/**
 * POST /inventory/admin/cleanup
 * Manual cleanup of expired reservations
 * Requires admin role
 */
router.post("/admin/cleanup", async (req, res) => {
  try {
    const result = await InventoryService.cleanupExpiredReservations();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    res.status(500).json({
      success: false,
      error: "Cleanup failed",
      details: error.message,
    });
  }
});

module.exports = router;

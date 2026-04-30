const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, authorize } = require("../middleware/auth");
const { validateOrder } = require("../middleware/validation");

// Get all orders - temporarily disabled auth for testing
router.get("/", orderController.getOrders);

// Get order statistics
router.get(
  "/stats",
  auth,
  authorize("admin", "manager"),
  orderController.getOrderStats,
);

// Get order by ID
router.get("/:id", auth, orderController.getOrder);

// Create new order
router.post("/", auth, validateOrder, orderController.createOrder);

// Update order
router.put("/:id", auth, orderController.updateOrder);

// Cancel order
router.put(
  "/:id/cancel",
  auth,
  authorize("admin", "manager"),
  orderController.cancelOrder,
);

// Delete order
router.delete("/:id", auth, authorize("admin"), orderController.deleteOrder);

module.exports = router;

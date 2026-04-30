/**
 * STOCK VALIDATION MIDDLEWARE
 * Validates stock availability before operations
 */

const InventoryService = require("../services/inventoryService");

// ====== VALIDATE ITEMS HAVE STOCK ======
const validateStockAvailability = async (req, res, next) => {
  try {
    const items = req.body.items || [];

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No items to validate",
      });
    }

    // Check availability for all items
    const validation = await InventoryService.validateBatchAvailability(items);

    if (!validation.allAvailable) {
      const failedItems = validation.validations.filter((v) => !v.isAvailable);

      return res.status(400).json({
        success: false,
        error: "Insufficient stock for some items",
        details: failedItems.map((item) => ({
          productId: item.product,
          requested: item.requestedQuantity,
          available: item.availableStock,
          message: item.message,
        })),
      });
    }

    // Attach validation results to request for later use
    req.stockValidation = validation;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Stock validation failed",
      details: error.message,
    });
  }
};

// ====== VALIDATE QUANTITY ======
const validateQuantity = (req, res, next) => {
  const items = req.body.items || [];

  for (const item of items) {
    if (!item.quantity || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: `Invalid quantity for product ${item.product}. Quantity must be >= 1`,
      });
    }

    if (!Number.isInteger(item.quantity)) {
      return res.status(400).json({
        success: false,
        error: `Invalid quantity for product ${item.product}. Quantity must be an integer`,
      });
    }
  }

  next();
};

// ====== VALIDATE PRODUCT EXISTS ======
const validateProductExists = async (req, res, next) => {
  try {
    const items = req.body.items || [];

    for (const item of items) {
      const product = await InventoryService._getProduct(
        item.product,
        item.productModel || "Product",
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.product} not found`,
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Product validation failed",
      details: error.message,
    });
  }
};

// ====== VALIDATE PRODUCT CREATION (Admin/Vendor) ======
const validateProductCreation = (req, res, next) => {
  const { stock, name, price, category } = req.body;

  // Check required fields
  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: name, price, category",
    });
  }

  // Stock validation
  if (stock === undefined || stock === null) {
    return res.status(400).json({
      success: false,
      error: "Stock field is required",
    });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      error: "Stock must be a non-negative integer",
    });
  }

  // Warning if stock is 0
  if (stock === 0) {
    req.warnings = req.warnings || [];
    req.warnings.push(
      "⚠️ Product created with 0 stock - it will not be visible to customers",
    );
  }

  // Warning if low stock
  if (stock > 0 && stock < 5) {
    req.warnings = req.warnings || [];
    req.warnings.push(
      `⚠️ Low stock alert: Only ${stock} units available`,
    );
  }

  // Price validation
  if (price <= 0) {
    return res.status(400).json({
      success: false,
      error: "Price must be greater than 0",
    });
  }

  next();
};

// ====== VALIDATE RESERVATION TOKEN ======
const validateReservationToken = (req, res, next) => {
  const token = req.body.reservationToken;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid reservation token is required",
    });
  }

  next();
};

module.exports = {
  validateStockAvailability,
  validateQuantity,
  validateProductExists,
  validateProductCreation,
  validateReservationToken,
};

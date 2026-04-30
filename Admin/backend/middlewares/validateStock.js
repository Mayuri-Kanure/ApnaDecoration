/**
 * CRITICAL VALIDATION MIDDLEWARE FOR STOCK FIELD
 * 
 * This is the SINGLE SOURCE OF TRUTH for stock validation.
 * All product creation and updates MUST go through this middleware.
 * 
 * Rules:
 * 1. Stock field is REQUIRED
 * 2. Stock must be a valid non-negative integer
 * 3. No silent defaults - always reject invalid data
 * 4. Clear error messages for debugging
 */

const stockLogger = require('../utils/stockLogger');

/**
 * Parse and validate stock from request body
 * Supports both 'stock' and 'stock_qty' field names for backward compatibility
 * But normalizes to 'stock' internally
 * 
 * @param {*} value - The stock value from request
 * @returns {number} Parsed stock value
 * @throws {Error} If validation fails
 */
function parseAndValidateStock(value) {
  // Check if value exists
  if (value === undefined || value === null || value === '') {
    throw new Error('Stock is required. Please provide a stock value.');
  }

  // Convert to integer
  const parsed = parseInt(value, 10);

  // Check if parsing was successful
  if (isNaN(parsed)) {
    throw new Error(`Stock must be a valid number. Received: "${value}"`);
  }

  // Check if non-negative
  if (parsed < 0) {
    throw new Error(`Stock cannot be negative. Received: ${parsed}`);
  }

  return parsed;
}

/**
 * Middleware: Validate stock field in create request
 * Used for: POST /api/products (create product)
 */
exports.validateStockCreate = (req, res, next) => {
  try {
    // Get stock from either 'stock' or 'stock_qty' field (backward compatibility)
    let stock = req.body.stock || req.body.stock_qty;

    // If productData is JSON string, parse it
    if (req.body.productData && typeof req.body.productData === 'string') {
      const parsed = JSON.parse(req.body.productData);
      stock = parsed.stock || parsed.stock_qty;
    } else if (req.body.productData && typeof req.body.productData === 'object') {
      stock = req.body.productData.stock || req.body.productData.stock_qty;
    }

    // Validate
    const validatedStock = parseAndValidateStock(stock);

    // Store in req for use in controller
    req.validatedStock = validatedStock;
    req.body.stock = validatedStock; // Normalize to 'stock' field
    if (req.body.productData && typeof req.body.productData === 'object') {
      req.body.productData.stock = validatedStock;
    }

    // Log successful validation
    stockLogger.logValidation('create_request', {
      originalValue: stock,
      parsedValue: validatedStock,
      userId: req.user?.userId || 'unknown',
      endpoint: req.path,
    });

    next();
  } catch (error) {
    stockLogger.logError('stock_validation_failed', {
      errorMessage: error.message,
      receivedValue: req.body.stock || req.body.stock_qty,
      endpoint: req.path,
      userId: req.user?.userId || 'unknown',
    });

    return res.status(400).json({
      success: false,
      message: `Stock validation failed: ${error.message}`,
      field: 'stock',
      receivedValue: req.body.stock || req.body.stock_qty,
    });
  }
};

/**
 * Middleware: Validate stock field in update request
 * Used for: PATCH /api/products/:id (update product)
 * 
 * Special case: If stock is not provided in update, it's allowed (preserves existing)
 * But if provided, must be valid
 */
exports.validateStockUpdate = (req, res, next) => {
  try {
    // Get stock from either 'stock' or 'stock_qty' field
    let stock = req.body.stock || req.body.stock_qty;

    // If productData is JSON string, parse it
    if (req.body.productData && typeof req.body.productData === 'string') {
      const parsed = JSON.parse(req.body.productData);
      stock = parsed.stock || parsed.stock_qty;
    } else if (req.body.productData && typeof req.body.productData === 'object') {
      stock = req.body.productData.stock || req.body.productData.stock_qty;
    }

    // For updates: if stock is provided, validate it
    if (stock !== undefined && stock !== null && stock !== '') {
      const validatedStock = parseAndValidateStock(stock);
      req.validatedStock = validatedStock;
      req.body.stock = validatedStock;
      if (req.body.productData && typeof req.body.productData === 'object') {
        req.body.productData.stock = validatedStock;
      }

      // Log successful validation
      stockLogger.logValidation('update_request_with_stock', {
        originalValue: stock,
        parsedValue: validatedStock,
        userId: req.user?.userId || 'unknown',
        endpoint: req.path,
      });
    } else {
      // No stock provided in update - that's OK, existing stock will be preserved
      req.validatedStock = undefined;
      stockLogger.logValidation('update_request_without_stock', {
        userId: req.user?.userId || 'unknown',
        endpoint: req.path,
        action: 'stock_will_be_preserved',
      });
    }

    next();
  } catch (error) {
    stockLogger.logError('stock_validation_failed_on_update', {
      errorMessage: error.message,
      receivedValue: req.body.stock || req.body.stock_qty,
      endpoint: req.path,
      userId: req.user?.userId || 'unknown',
    });

    return res.status(400).json({
      success: false,
      message: `Stock validation failed: ${error.message}`,
      field: 'stock',
      receivedValue: req.body.stock || req.body.stock_qty,
    });
  }
};

/**
 * Helper: Validate stock value in service/controller code
 * Export this for use outside middleware
 */
exports.validateStock = parseAndValidateStock;

/**
 * Helper: Check if stock value is valid (non-throwing version)
 * Returns { valid: boolean, value?: number, error?: string }
 */
exports.isValidStock = (value) => {
  try {
    const validated = parseAndValidateStock(value);
    return {
      valid: true,
      value: validated,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      receivedValue: value,
    };
  }
};

/**
 * Helper: Safely parse stock or return error
 * For use in catch blocks and error handlers
 */
exports.safeParseStock = (value, defaultValue = undefined) => {
  try {
    return parseAndValidateStock(value);
  } catch (error) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
};

module.exports = exports;

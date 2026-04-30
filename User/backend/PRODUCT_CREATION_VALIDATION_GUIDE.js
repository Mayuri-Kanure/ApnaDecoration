/**
 * PRODUCT CREATION VALIDATION
 * Prevents admin/vendor from creating products without proper stock
 * 
 * Add this middleware to product creation routes
 */

const {
  validateProductCreation,
} = require("../middlewares/stockValidation");

/**
 * ENHANCED PRODUCT CONTROLLER
 * Modify your existing admin or vendor product controller
 * 
 * Example locations:
 * - Admin/backend/controllers/productController.js
 * - User/backend/controllers/vendorProductController.js
 */

// ====== ADD THIS TO YOUR PRODUCT CREATION CONTROLLER ======

// Example for admin product creation:
/*
router.post(
  "/",
  authMiddleware,
  adminOnly,
  validateProductCreation,  // ← ADD THIS MIDDLEWARE
  async (req, res) => {
    try {
      const { name, price, category, stock, images, description } = req.body;

      // Check for warnings (low stock, zero stock)
      const warnings = req.warnings || [];

      // Create product
      const product = new Product({
        name,
        price,
        category,
        stock,
        images,
        description,
        createdBy: req.user._id,
        status: stock > 0 ? "active" : "out_of_stock",
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);
*/

// ====== OR FOR VENDOR PRODUCT SUBMISSION ======

/*
router.post(
  "/submit",
  authMiddleware,
  validateProductCreation,  // ← ADD THIS MIDDLEWARE
  async (req, res) => {
    try {
      const { name, price, category, stock, sku, images, description } = req.body;

      // Validate SKU is unique
      const existingSku = await VendorProduct.findOne({ sku });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: "SKU already exists. Please use a unique SKU.",
        });
      }

      const warnings = req.warnings || [];

      // Create vendor product (will be pending approval)
      const vendorProduct = new VendorProduct({
        name,
        price,
        category,
        stock,
        sku,
        images,
        description,
        vendorId: req.user._id,
        status: "pending",
      });

      await vendorProduct.save();

      res.status(201).json({
        success: true,
        message: "Product submitted for approval",
        product: vendorProduct,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);
*/

/**
 * ====== PRODUCT UPDATE VALIDATION ======
 * Also add validation when updating stock
 */

const validateStockUpdate = (req, res, next) => {
  const { stock } = req.body;

  if (stock === undefined) {
    // Not updating stock, skip
    return next();
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({
      success: false,
      error: "Stock must be a non-negative integer",
    });
  }

  next();
};

// Example usage in update route:
/*
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  validateStockUpdate,
  async (req, res) => {
    try {
      const { stock, ...otherData } = req.body;

      const update = { ...otherData };

      if (stock !== undefined) {
        update.stock = stock;
        update.status = stock > 0 ? "active" : "out_of_stock";
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true },
      );

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);
*/

/**
 * ====== BULK IMPORT VALIDATION ======
 * For bulk product uploads (CSV import)
 */

const validateBulkProductImport = (req, res, next) => {
  const products = req.body.products || [];

  if (products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No products provided",
    });
  }

  const errors = [];
  const warnings = [];

  products.forEach((product, index) => {
    // Check required fields
    if (!product.name) {
      errors.push(`Row ${index + 1}: Name is required`);
    }
    if (!product.price) {
      errors.push(`Row ${index + 1}: Price is required`);
    }
    if (product.price <= 0) {
      errors.push(`Row ${index + 1}: Price must be > 0`);
    }
    if (!product.category) {
      errors.push(`Row ${index + 1}: Category is required`);
    }

    // Check stock
    if (product.stock === undefined) {
      errors.push(`Row ${index + 1}: Stock is required`);
    } else if (!Number.isInteger(parseInt(product.stock))) {
      errors.push(`Row ${index + 1}: Stock must be an integer`);
    } else if (parseInt(product.stock) < 0) {
      errors.push(`Row ${index + 1}: Stock cannot be negative`);
    } else if (parseInt(product.stock) === 0) {
      warnings.push(
        `Row ${index + 1}: Product "${product.name}" has 0 stock - won't be visible`,
      );
    } else if (parseInt(product.stock) < 5) {
      warnings.push(
        `Row ${index + 1}: Product "${product.name}" has low stock (${product.stock})`,
      );
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Import validation failed",
      errors,
    });
  }

  req.importWarnings = warnings;
  next();
};

// Usage in bulk import route:
/*
router.post(
  "/bulk/import",
  authMiddleware,
  adminOnly,
  validateBulkProductImport,
  async (req, res) => {
    try {
      const products = req.body.products;

      // Insert all
      const inserted = await Product.insertMany(
        products.map(p => ({
          ...p,
          createdBy: req.user._id,
          status: p.stock > 0 ? "active" : "out_of_stock",
        })),
      );

      res.status(201).json({
        success: true,
        message: `Imported ${inserted.length} products`,
        imported: inserted.length,
        warnings: req.importWarnings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);
*/

module.exports = {
  validateStockUpdate,
  validateBulkProductImport,
};

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const cloudinaryService = require("../services/cloudinaryService");

// Get all products
router.get("/", productController.getAllProducts);

// Get featured products
router.get("/featured/all", productController.getFeaturedProducts);

// Get stores (placeholder for admin compatibility)
router.get("/stores", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Stores endpoint - placeholder implementation",
  });
});

// Get brands (placeholder for admin compatibility)
router.get("/brands", (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Brands endpoint - placeholder implementation",
  });
});

// Get single product by ID (MUST be last)
router.get("/:id", productController.getProductById);

// Toggle featured status
router.put("/:id/toggle-featured", productController.toggleFeatured);

// Create new product with file upload - Production Ready
router.post("/", cloudinaryService.uploadProductImages(), async (req, res) => {
  try {
    // Handle both formats: direct fields and productData JSON
    let productData;

    if (req.body.productData) {
      // Frontend sends productData as JSON string
      productData = JSON.parse(req.body.productData);
    } else {
      // Direct form fields
      productData = req.body;
    }

    // Collect all uploaded files
    let allFiles = [];

    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      allFiles.push(...req.files.thumbnail);
    }

    if (req.files && req.files.images && req.files.images.length > 0) {
      allFiles.push(...req.files.images);
    }

    if (req.files && req.files.meta_image && req.files.meta_image.length > 0) {
      allFiles.push(...req.files.meta_image);
    }

    // Map uploaded files to Cloudinary URLs
    const imagePaths = allFiles.map(
      (file) =>
        file.secure_url || file.path || `/uploads/products/${file.filename}`,
    );

    // Call controller function with product data and images array
    const result = await productController.createProduct(
      productData,
      imagePaths,
    );

    res.status(201).json({ success: true, product: result });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product with file upload - Production Ready
router.put(
  "/:id",
  cloudinaryService.uploadProductImages(),
  async (req, res) => {
    try {
      // Handle both formats: direct fields and productData JSON
      let productData;

      if (req.body.productData) {
        // Frontend sends productData as JSON string
        productData = JSON.parse(req.body.productData);
      } else {
        // Direct form fields
        productData = req.body;
      }

      // Collect all uploaded files with null checks
      let allFiles = [];

      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        allFiles.push(...req.files.thumbnail);
      }

      if (req.files && req.files.images && req.files.images.length > 0) {
        allFiles.push(...req.files.images);
      }

      if (
        req.files &&
        req.files.meta_image &&
        req.files.meta_image.length > 0
      ) {
        allFiles.push(...req.files.meta_image);
      }

      // Map uploaded files to Cloudinary URLs
      const imagePaths = allFiles.map(
        (file) =>
          file.secure_url || file.path || `/uploads/products/${file.filename}`,
      );

      const result = await productController.updateProduct(
        req.params.id,
        productData,
        imagePaths,
      );

      res.status(200).json({ success: true, product: result });
    } catch (error) {
      console.error("Product update error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;

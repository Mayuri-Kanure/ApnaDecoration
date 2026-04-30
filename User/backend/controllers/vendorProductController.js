const VendorProduct = require("../models/VendorProduct");
const Product = require("../models/Product");

// Get public vendor products (no auth required)
exports.getPublicVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: "approved" }; // Only show approved products

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("vendorId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VendorProduct.countDocuments(query);

    res.json({
      success: true,
      data: vendorProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching public vendor products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor products",
      error: error.message,
    });
  }
};

// Get public vendor product by ID (no auth required)
exports.getPublicVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProduct = await VendorProduct.findOne({
      _id: id,
      status: "approved", // Only show approved products
    }).populate("vendorId", "name");

    if (!vendorProduct) {
      return res.status(404).json({
        success: false,
        message: "Vendor product not found",
      });
    }

    res.json({
      success: true,
      data: vendorProduct,
    });
  } catch (error) {
    console.error("Error fetching public vendor product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor product",
      error: error.message,
    });
  }
};

// Get all vendor products (admin only)
exports.getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const vendorProducts = await VendorProduct.find(query)
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VendorProduct.countDocuments(query);

    res.json({
      success: true,
      products: vendorProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting vendor products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get new vendor product requests (admin only)
exports.getNewRequests = async (req, res) => {
  try {
    const newRequests = await VendorProduct.find({ status: "pending" })
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: newRequests,
      count: newRequests.length,
    });
  } catch (error) {
    console.error("Error getting new vendor requests:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get approved vendor products (admin only)
exports.getApprovedProducts = async (req, res) => {
  try {
    const approvedProducts = await VendorProduct.find({ status: "approved" })
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: approvedProducts,
      count: approvedProducts.length,
    });
  } catch (error) {
    console.error("Error getting approved vendor products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get denied vendor products (admin only)
exports.getDeniedProducts = async (req, res) => {
  try {
    const deniedProducts = await VendorProduct.find({ status: "denied" })
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: deniedProducts,
      count: deniedProducts.length,
    });
  } catch (error) {
    console.error("Error getting denied vendor products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get pending vendor products (admin only)
exports.getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await VendorProduct.find({ status: "pending" })
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: pendingProducts,
      count: pendingProducts.length,
    });
  } catch (error) {
    console.error("Error getting pending vendor products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Approve vendor product (admin only)
exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProduct = await VendorProduct.findByIdAndUpdate(
      id,
      {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: req.user.id,
      },
      { new: true },
    );

    if (!vendorProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor product not found" });
    }

    // Create a regular product from the approved vendor product
    const regularProduct = new Product({
      name: vendorProduct.name,
      description: vendorProduct.description,
      price: vendorProduct.price,
      category: vendorProduct.category,
      images: vendorProduct.images,
      thumbnail: vendorProduct.thumbnail,
      vendorId: vendorProduct.vendorId,
      vendorProductId: vendorProduct._id,
      stock: vendorProduct.stock,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await regularProduct.save();

    res.json({
      success: true,
      message: "Vendor product approved successfully",
      vendorProduct,
      regularProduct,
    });
  } catch (error) {
    console.error("Error approving vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Deny vendor product (admin only)
exports.denyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const vendorProduct = await VendorProduct.findByIdAndUpdate(
      id,
      {
        status: "denied",
        deniedAt: new Date(),
        deniedBy: req.user.id,
        denialReason: reason || "Product does not meet requirements",
      },
      { new: true },
    );

    if (!vendorProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor product not found" });
    }

    res.json({
      success: true,
      message: "Vendor product denied successfully",
      vendorProduct,
    });
  } catch (error) {
    console.error("Error denying vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Create vendor product (vendor only)
exports.createVendorProduct = async (req, res) => {
  try {
    console.log("🔍 Backend - Request body:", req.body);
    console.log("🔍 Backend - Request files:", req.files);
    console.log("🔍 Backend - req.files type:", typeof req.files);
    console.log("🔍 Backend - req.files length:", req.files?.length || "N/A");
    if (req.files && req.files.length > 0) {
      console.log(
        "🔍 Backend - File details:",
        req.files.map((f) => ({
          originalname: f.originalname,
          filename: f.filename,
          path: f.path,
        })),
      );
    }

    // Handle both JSON and FormData
    let name, description, price, category, sku, stock, vendorId;

    if (req.body instanceof Object && !Array.isArray(req.body)) {
      // JSON data or parsed FormData
      name = req.body.name;
      description = req.body.description;
      price = req.body.price;
      category = req.body.category;
      sku = req.body.sku;
      stock = req.body.stock || 0;
      vendorId = req.body.vendor || req.user.id;
    } else {
      // Fallback for other formats
      name = req.body?.name;
      description = req.body?.description;
      price = req.body?.price;
      category = req.body?.category;
      sku = req.body?.sku;
      stock = req.body?.stock || 0;
      vendorId = req.body?.vendor || req.user.id;
    }

    console.log("🔍 Backend - Extracted data:", {
      name,
      description,
      price,
      category,
      sku,
      stock,
      vendorId,
    });

    // Validate required fields
    if (!name || !description || !price || !category) {
      console.log("❌ Backend - Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "name, description, price, and category are required",
      });
    }

    // Generate SKU if not provided
    const generatedSKU =
      sku || `VND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      // multer with upload.array('images') provides req.files directly as an array
      images = req.files.map(
        (file) => `/uploads/vendor-products/${file.filename}`,
      );
      console.log("🔍 Backend - Processed images from req.files:", images);
    } else if (req.body.images && typeof req.body.images === "string") {
      images = [req.body.images];
      console.log("🔍 Backend - Processed images from body:", images);
    }

    console.log("🔍 Backend - Processed images:", images);

    // Create vendor product with pending status
    const vendorProduct = new VendorProduct({
      name,
      description,
      price: parseFloat(price),
      category,
      sku: generatedSKU,
      images,
      stock: parseInt(stock) || 0,
      vendorId: req.user.id, // Use authenticated user's ID
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("🔍 Backend - Creating vendor product:", vendorProduct);

    await vendorProduct.save();

    res.status(201).json({
      success: true,
      message: "Vendor product created successfully. It is pending approval.",
      vendorProduct,
    });
  } catch (error) {
    console.error("❌ Backend - Error creating vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get single vendor product
exports.getVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Backend - Getting vendor product:", id);
    console.log("🔍 Backend - User ID:", req.user.id);
    console.log("🔍 Backend - User role:", req.user.role);

    // Ensure the vendor can only access their own products
    const vendorProduct = await VendorProduct.findOne({
      _id: id,
      vendorId: req.user.id,
    });

    if (!vendorProduct) {
      console.log("❌ Backend - Vendor product not found or access denied");
      return res.status(404).json({
        success: false,
        error: "Vendor product not found or access denied",
      });
    }

    console.log("✅ Backend - Vendor product found:", vendorProduct.name);

    res.json({
      success: true,
      vendorProduct,
    });
  } catch (error) {
    console.error("Error getting vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get vendor's own products (vendor only)
exports.getMyVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    console.log("🔍 Backend - Getting vendor products for user:", req.user.id);
    console.log("🔍 Backend - Query params:", { page, limit, status });

    let query = { vendorId: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    console.log("🔍 Backend - MongoDB query:", query);

    const vendorProducts = await VendorProduct.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("🔍 Backend - Found products:", vendorProducts.length);
    vendorProducts.forEach((product, index) => {
      console.log(`🔍 Backend - Product ${index}:`, {
        id: product._id,
        name: product.name,
        images: product.images,
        thumbnail: product.thumbnail,
        imageCount: product.images?.length || 0,
      });
    });

    const total = await VendorProduct.countDocuments(query);

    const response = {
      success: true,
      products: vendorProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    };

    console.log("🔍 Backend - Sending response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error getting vendor products:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update vendor product (vendor only)
exports.updateVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure the vendor can only update their own products
    const vendorProduct = await VendorProduct.findOne({
      _id: id,
      vendorId: req.user.id,
    });

    if (!vendorProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor product not found" });
    }

    // If product is already approved, don't allow updates
    if (vendorProduct.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update approved product" });
    }

    const updatedProduct = await VendorProduct.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );

    res.json({
      success: true,
      message: "Vendor product updated successfully",
      vendorProduct: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update vendor product with files (vendor only)
exports.updateVendorProductWithFiles = async (req, res) => {
  console.log("🚀 CONTROLLER HIT - updateVendorProductWithFiles called!");
  console.log("🚀 CONTROLLER - Request method:", req.method);
  console.log("🚀 CONTROLLER - Request URL:", req.originalUrl);
  console.log("🚀 CONTROLLER - Request headers:", req.headers);
  console.log("🚀 CONTROLLER - Content-Type:", req.headers["content-type"]);
  try {
    const { id } = req.params;

    console.log("🔍 Backend - Updating vendor product with files:", id);
    console.log("🔍 Backend - Request body:", req.body);
    console.log("🔍 Backend - Uploaded files:", req.files);

    // Parse removed images if present
    let removedImages = [];
    if (req.body.removedImages) {
      try {
        removedImages = JSON.parse(req.body.removedImages);
        console.log("🗑️ Backend - Images to remove:", removedImages);
      } catch (error) {
        console.error("❌ Error parsing removedImages:", error);
        removedImages = [];
      }
    }

    // Ensure the vendor can only update their own products
    const vendorProduct = await VendorProduct.findOne({
      _id: id,
      vendorId: req.user.id,
    });

    if (!vendorProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor product not found" });
    }

    // If product is already approved, don't allow updates
    if (vendorProduct.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot update approved product" });
    }

    // Build update data from form fields
    const updateData = {
      name: req.body.name,
      sku: req.body.sku,
      price: req.body.price,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      updatedAt: new Date(),
    };

    // Handle images - FILTER existing images and APPEND new ones
    const existingImages = vendorProduct.images || [];

    // Filter out removed images from existing images
    let filteredImages = existingImages;
    if (removedImages.length > 0) {
      filteredImages = existingImages.filter(
        (img) => !removedImages.includes(img),
      );
      console.log("🔍 Backend - Images before removal:", existingImages);
      console.log("🔍 Backend - Images after removal:", filteredImages);
    }

    // Add new images if any
    if (req.files && req.files.length > 0) {
      console.log("🔍 Backend - Processing new images...");
      console.log("🔍 Backend - req.files:", req.files);
      console.log("🔍 Backend - req.files length:", req.files.length);

      const newImagePaths = req.files.map((file) => {
        console.log("🔍 Backend - New image file:", file);
        console.log("🔍 Backend - New image path:", file.path);
        console.log("🔍 Backend - New image filename:", file.filename);
        console.log("🔍 Backend - New image originalname:", file.originalname);

        // Convert absolute path to relative path for frontend
        let relativePath = file.path.replace(/^.*[\/\\]/, "");
        console.log("🔍 Backend - Original path:", file.path);
        console.log(
          "🔍 Backend - Relative path after replacement:",
          relativePath,
        );

        // Ensure the path starts with /uploads/vendor-products/
        if (!relativePath.startsWith("uploads/")) {
          relativePath = `uploads/vendor-products/${file.filename}`;
          console.log("🔍 Backend - Fixed relative path:", relativePath);
        }

        return relativePath;
      });

      // Combine filtered existing images with new ones
      updateData.images = [...filteredImages, ...newImagePaths];

      console.log("🔍 Backend - Existing images:", existingImages);
      console.log("🔍 Backend - Filtered images:", filteredImages);
      console.log("🔍 Backend - New image paths:", newImagePaths);
      console.log(
        "🔍 Backend - Final images after adding new ones:",
        updateData.images,
      );
      console.log(
        "🔍 Backend - Total images after update:",
        updateData.images.length,
      );

      // Set thumbnail as first image if no thumbnail exists
      if (!vendorProduct.thumbnail && updateData.images.length > 0) {
        updateData.thumbnail = updateData.images[0];
        console.log("🔍 Backend - Setting thumbnail:", updateData.images[0]);
      } else {
        console.log(
          "🔍 Backend - Existing thumbnail:",
          vendorProduct.thumbnail,
        );
      }
    } else {
      console.log("🔍 Backend - No new files uploaded");
      console.log("🔍 Backend - req.files:", req.files);
      // Use filtered images if no new files uploaded
      updateData.images = filteredImages;
    }

    console.log("🔍 Backend - Final update data:", updateData);

    const updatedProduct = await VendorProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    console.log("🔍 Backend - Updated product:", updatedProduct);
    console.log("🔍 Backend - Updated product images:", updatedProduct.images);
    console.log(
      "🔍 Backend - Updated product thumbnail:",
      updatedProduct.thumbnail,
    );
    console.log(
      "🔍 Backend - Updated product full data:",
      JSON.stringify(updatedProduct, null, 2),
    );

    res.json({
      success: true,
      message: "Vendor product updated successfully with images",
      vendorProduct: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating vendor product with files:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete vendor product (vendor only)
exports.deleteVendorProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the vendor can only delete their own products
    const vendorProduct = await VendorProduct.findOne({
      _id: id,
      vendorId: req.user.id,
    });

    if (!vendorProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor product not found" });
    }

    // If product is already approved, don't allow deletion
    if (vendorProduct.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete approved product" });
    }

    await VendorProduct.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Vendor product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

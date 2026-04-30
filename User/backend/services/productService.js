const { Product, Category, VendorProduct } = require("../models");

// Constants directly defined since utils are in Shared Resources
const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

class ProductService {
  // Get all products with filters (including approved vendor products)
  static async getProducts(filters = {}) {
    const {
      page = 1,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
      trending,
      status = "active",
    } = filters;

    const skip = (page - 1) * limit;

    // Build query for regular products
    // 🔒 CRITICAL: Hide out-of-stock products from listing
    const regularProductQuery = { status, stock: { $gt: 0 } };

    if (category) {
      regularProductQuery.category = category;
    }

    if (minPrice || maxPrice) {
      regularProductQuery.price = {};
      if (minPrice) regularProductQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) regularProductQuery.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      regularProductQuery.$text = { $search: search };
    }

    if (featured !== undefined) {
      regularProductQuery.featured = featured === "true";
    }

    if (trending !== undefined) {
      regularProductQuery.trending = trending === "true";
    }

    // Build query for approved vendor products
    // 🔒 CRITICAL: Hide out-of-stock vendor products from listing
    const vendorProductQuery = { status: "approved", stock: { $gt: 0 } };

    if (category) {
      vendorProductQuery.category = category;
    }

    if (minPrice || maxPrice) {
      vendorProductQuery.price = {};
      if (minPrice) vendorProductQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) vendorProductQuery.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      vendorProductQuery.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute both queries in parallel
    const [regularProducts, vendorProducts] = await Promise.all([
      Product.find(regularProductQuery)
        .populate("category", "name")
        .sort(sort)
        .skip(skip)
        .limit(Math.min(limit, PAGINATION.MAX_LIMIT)),

      VendorProduct.find(vendorProductQuery)
        .populate("category", "name")
        .sort(sort)
        .skip(skip)
        .limit(Math.min(limit, PAGINATION.MAX_LIMIT)),
    ]);

    // Transform vendor products to match regular product format
    const transformedVendorProducts = vendorProducts.map((vp) => ({
      ...vp.toObject(),
      // Map vendor product fields to regular product format
      name: vp.name,
      description: vp.description,
      price: vp.price,
      category: vp.category,
      thumbnail: vp.images && vp.images.length > 0 ? vp.images[0] : null,
      images: vp.images || [],
      sku: vp.sku,
      status: vp.status === "approved" ? "active" : vp.status,
      featured: false, // Vendor products don't have featured field
      trending: false, // Vendor products don't have trending field
      // Add source identifier
      source: "vendor",
      vendorId: vp.vendorId,
    }));

    // Combine both product types
    const allProducts = [...regularProducts, ...transformedVendorProducts];

    // Apply final sorting to combined results
    allProducts.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b[sortBy] || 0) - new Date(a[sortBy] || 0);
      } else {
        return new Date(a[sortBy] || 0) - new Date(b[sortBy] || 0);
      }
    });

    // Apply pagination to combined results
    const paginatedProducts = allProducts.slice(skip, skip + limit);

    const total =
      (await Product.countDocuments(regularProductQuery)) +
      (await VendorProduct.countDocuments(vendorProductQuery));

    return {
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get product by ID (including vendor products)
  static async getProductById(productId) {
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      throw new Error("Invalid product ID");
    }

    // First try to find in regular products
    let product = await Product.findById(productId).populate(
      "category",
      "name description",
    );

    // If not found, try vendor products
    if (!product) {
      const vendorProduct = await VendorProduct.findById(productId).populate(
        "category",
        "name description",
      );

      if (vendorProduct && vendorProduct.status === "approved") {
        // Transform vendor product to regular product format
        product = {
          ...vendorProduct.toObject(),
          name: vendorProduct.name,
          description: vendorProduct.description,
          price: vendorProduct.price,
          category: vendorProduct.category,
          thumbnail:
            vendorProduct.images && vendorProduct.images.length > 0
              ? vendorProduct.images[0]
              : null,
          images: vendorProduct.images || [],
          sku: vendorProduct.sku,
          status:
            vendorProduct.status === "approved"
              ? "active"
              : vendorProduct.status,
          featured: false,
          trending: false,
          source: "vendor",
          vendorId: vendorProduct.vendorId,
        };
      }
    }

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  // Create new product
  static async createProduct(productData, userId) {
    const stockValidator = require('../middlewares/validateStock');
    const stockLogger = require('../utils/stockLogger');

    try {
      // Basic validation
      const { name, description, price, category, stock } = productData;
      const errors = [];

      if (!name || name.trim().length < 2) {
        errors.push("Product name is required");
      }

      if (!description || description.trim().length < 10) {
        errors.push("Product description is required");
      }

      if (!price || parseFloat(price) <= 0) {
        errors.push("Valid price is required");
      }

      if (!category) {
        errors.push("Product category is required");
      }

      // ===== CRITICAL: Validate stock field =====
      if (stock === undefined || stock === null || stock === "" || stock === '') {
        errors.push("Stock quantity is required");
      } else {
        const validation = stockValidator.isValidStock(stock);
        if (!validation.valid) {
          errors.push(`Stock validation failed: ${validation.error}`);
        }
      }

      if (errors.length > 0) {
        const errorMessage = `Validation failed: ${errors.join(", ")}`;
        stockLogger.logError('product_create_validation_failed', {
          errorMessage,
          productName: name,
          receivedStock: stock,
          userId,
        });
        throw new Error(errorMessage);
      }

      // Validate and get final stock value
      const validatedStock = stockValidator.validateStock(stock);

      // Generate SKU if not provided
      if (!productData.sku) {
        productData.sku = `PRD-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)
          .toUpperCase()}`;
      }

      const product = new Product({
        ...productData,
        stock: validatedStock, // ===== ONLY STOCK FIELD =====
        createdBy: userId,
        status: PRODUCT_STATUS.ACTIVE,
      });

      const savedProduct = await product.save();

      // Log successful creation
      stockLogger.logProductCreate(
        savedProduct._id,
        name,
        validatedStock,
        userId
      );

      console.log(`✅ USER PRODUCT CREATED: ${name} - stock=${validatedStock}`);

      return savedProduct;
    } catch (error) {
      console.error("❌ Product creation error:", error.message);
      throw error;
    }
  }

  // Update product
  static async updateProduct(productId, updateData, userId) {
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate update data
    if (updateData.price && parseFloat(updateData.price) <= 0) {
      throw new Error("Invalid price");
    }

    // Update product
    Object.assign(product, updateData);
    product.updatedAt = new Date();

    return await product.save();
  }

  // Delete product
  static async deleteProduct(productId, userId) {
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Soft delete by changing status
    product.status = PRODUCT_STATUS.INACTIVE;
    product.deletedAt = new Date();

    return await product.save();
  }

  // Get featured products
  static async getFeaturedProducts(limit = 10) {
    return await Product.find({
      status: PRODUCT_STATUS.ACTIVE,
      $or: [{ featured: true }, { is_featured: true }],
    })
      .populate("category", "name")
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit);
  }

  // Get trending products
  static async getTrendingProducts(limit = 10) {
    return await Product.find({
      trending: true,
      status: PRODUCT_STATUS.ACTIVE,
    })
      .populate("category", "name")
      .sort({ trending: -1, createdAt: -1 })
      .limit(limit);
  }

  // Search products
  static async searchProducts(searchTerm, filters = {}) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error("Search term must be at least 2 characters");
    }

    const { page = 1, limit = PAGINATION.DEFAULT_LIMIT, category } = filters;

    const skip = (page - 1) * limit;

    // Build search query
    const query = {
      $text: { $search: searchTerm },
      status: PRODUCT_STATUS.ACTIVE,
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(Math.min(limit, PAGINATION.MAX_LIMIT));

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get products by category
  static async getProductsByCategory(categoryId, filters = {}) {
    if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      throw new Error("Invalid category ID");
    }

    const {
      page = 1,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    const query = {
      category: categoryId,
      status: PRODUCT_STATUS.ACTIVE,
    };

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(Math.min(limit, PAGINATION.MAX_LIMIT));

    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update product stock
  static async updateStock(productId, quantity, operation = "set") {
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      throw new Error("Invalid product ID");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    switch (operation) {
      case "add":
        product.stock += quantity;
        break;
      case "subtract":
        product.stock = Math.max(0, product.stock - quantity);
        break;
      case "set":
      default:
        product.stock = Math.max(0, quantity);
        break;
    }

    // Update status based on stock
    if (product.stock === 0) {
      product.status = PRODUCT_STATUS.OUT_OF_STOCK;
    } else if (product.status === PRODUCT_STATUS.OUT_OF_STOCK) {
      product.status = PRODUCT_STATUS.ACTIVE;
    }

    return await product.save();
  }
}

module.exports = ProductService;

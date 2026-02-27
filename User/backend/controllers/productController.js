const { ProductService } = require('../services');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const productController = {
  // Get all products with filters - Fetch from Admin backend
  getProducts: async (req, res) => {
    try {
      // Fetch from Admin backend instead of local database
      const adminApiUrl = process.env.ADMIN_API_URL || 'https://admin-api.apnadecoration.com/api';
      const response = await axios.get(`${adminApiUrl}/products`, {
        params: req.query
      });
      
      res.json({
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }
  },

  // Get product by ID - Fetch from Admin backend
  getProductById: async (req, res) => {
    try {
      // Fetch from Admin backend instead of local database
      const adminApiUrl = process.env.ADMIN_API_URL || 'https://admin-api.apnadecoration.com/api';
      const response = await axios.get(`${adminApiUrl}/products/${req.params.id}`);
      
      res.json({
        success: true,
        data: response.data.data || null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q: searchTerm, ...filters } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const result = await ProductService.searchProducts(searchTerm, filters);
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error.message
      });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const products = await ProductService.getFeaturedProducts(parseInt(limit));
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured products',
        error: error.message
      });
    }
  },

  // Get trending products
  getTrendingProducts: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const products = await ProductService.getTrendingProducts(parseInt(limit));
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending products',
        error: error.message
      });
    }
  },

  // Get products by category
  getProductsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const result = await ProductService.getProductsByCategory(categoryId, req.query);
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products by category',
        error: error.message
      });
    }
  },

  // Create new product (Admin only)
  createProduct: async (req, res) => {
    try {
      // Input validation
      const { name, price, description, category } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Product name is required'
        });
      }
      if (!price || isNaN(price) || parseFloat(price) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid product price is required'
        });
      }
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Product category is required'
        });
      }

      const productData = {
        ...req.body,
        images: req.files ? req.files.map(file => file.path || file.secure_url || `/uploads/products/${file.filename}`) : [],
        thumbnail: req.files && req.files.length > 0 ? req.files[0].path || req.files[0].secure_url || `/uploads/products/${req.files[0].filename}` : null
      };

      const product = await ProductService.createProduct(productData, req.user.userId);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }
  },

  // Update product (Admin only)
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        images: req.files ? req.files.map(file => file.path || file.secure_url) : undefined
      };

      const product = await ProductService.updateProduct(id, updateData, req.user.userId);
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  },

  // Delete product (Admin only)
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id, req.user.userId);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  },

  // Update product stock
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;
      
      const product = await ProductService.updateStock(id, quantity, operation);
      
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update stock',
        error: error.message
      });
    }
  }
};

module.exports = productController;

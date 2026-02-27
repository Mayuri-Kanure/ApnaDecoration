import apiService, { productApi } from './api';

const productService = {
  // Get all products with optional filtering
  getProducts: async (params = {}) => {
    try {
      console.log('🔍 ProductService: Fetching products from Admin backend...');
      console.log('🔍 ProductService: PRODUCT_API_URL:', process.env.REACT_APP_PRODUCT_API_URL);
      console.log('🔍 ProductService: Request params:', params);
      const response = await productApi.get('/products', { params });
      console.log('✅ ProductService: Raw response received');
      console.log('✅ ProductService: Response type:', typeof response);
      console.log('✅ ProductService: Response data:', response?.data);
      console.log('✅ ProductService: Full response:', response);
      return response; // Return response directly (data already extracted by interceptor)
    } catch (error) {
      console.error('❌ ProductService: Error fetching products:', error);
      console.error('❌ ProductService: Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (id) => {
    try {
      const response = await productApi.get(`/products/${id}`);
      return response; // Return the response directly (data already extracted by interceptor)
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await apiService.getFeaturedProducts();
      return response; // Return the response directly (data already extracted by interceptor)
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    try {
      const response = await apiService.searchProducts(query);
      return response;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiService.get(`/products/category/${categoryId}`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get related products
  getRelatedProducts: async (productId) => {
    try {
      const response = await apiService.get(`/products/${productId}/related`);
      return response;
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    try {
      const response = await apiService.getReviews(productId);
      return response;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Create new product (admin only)
  createProduct: async (productData) => {
    try {
      const response = await apiService.post('/products', productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (admin only)
  updateProduct: async (id, productData) => {
    try {
      const response = await apiService.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    try {
      const response = await apiService.delete(`/products/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get products on sale
  getSaleProducts: async () => {
    try {
      const response = await apiService.get('/products/sale');
      return response;
    } catch (error) {
      console.error('Error fetching sale products:', error);
      throw error;
    }
  },

  // Get new arrivals
  getNewArrivals: async () => {
    try {
      const response = await apiService.get('/products/new');
      return response;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  // Get best sellers
  getBestSellers: async () => {
    try {
      const response = await apiService.get('/products/bestsellers');
      return response;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },

  // Check product availability
  checkAvailability: async (productId, quantity = 1) => {
    try {
      const response = await apiService.get(`/products/${productId}/availability`, {
        params: { quantity }
      });
      return response;
    } catch (error) {
      console.error('Error checking product availability:', error);
      throw error;
    }
  },
};

export default productService;

import apiService from './api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiService.getCategories();
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategory: async (id) => {
    try {
      const response = await apiService.getCategory(id);
      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiService.getProductsByCategory(categoryId, params);
      return response;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Create new category (admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await apiService.post('/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category (admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiService.put(`/categories/${id}`, categoryData);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category (admin only)
  deleteCategory: async (id) => {
    try {
      const response = await apiService.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get home categories (featured categories for homepage)
  getHomeCategories: async () => {
    try {
      const response = await apiService.get('/categories/public?homeCategory=true&status=active');
      return response;
    } catch (error) {
      console.error('Error fetching home categories:', error);
      throw error;
    }
  },

  // Get featured service categories
  getFeaturedCategories: async () => {
    try {
      const response = await apiService.get('/categories/featured');
      return response;
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      throw error;
    }
  },

  // Get subcategories of a category
  getSubcategories: async (categoryId) => {
    try {
      const response = await apiService.get(`/categories/${categoryId}/subcategories`);
      return response;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },
};

export default categoryService;

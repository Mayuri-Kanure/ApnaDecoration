import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

const serviceCategoryService = {
  // Get all service categories
  getAllServiceCategories: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/service-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  // Get service category by ID
  getServiceCategoryById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/service-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.category;
    } catch (error) {
      console.error('Error fetching service category:', error);
      throw error;
    }
  },

  // Create service category
  createServiceCategory: async (categoryData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/service-categories`, categoryData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service category:', error);
      throw error;
    }
  },

  // Update service category
  updateServiceCategory: async (id, categoryData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/service-categories/${id}`, categoryData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating service category:', error);
      throw error;
    }
  },

  // Delete service category
  deleteServiceCategory: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/service-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting service category:', error);
      throw error;
    }
  }
};

export default serviceCategoryService;

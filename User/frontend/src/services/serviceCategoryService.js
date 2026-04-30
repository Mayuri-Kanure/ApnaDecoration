import apiService, { api, serviceCategoryApi } from "./api";
import { SERVICE_CATEGORY_API_URL } from "../config/constants";

const serviceCategoryService = {
  // Get all service categories
  getServiceCategories: async () => {
    try {
      const response = await apiService.getServiceCategories();
      return response;
    } catch (error) {
      console.error("Error fetching service categories:", error);
      throw error;
    }
  },

  // Get service category by ID
  getServiceCategory: async (id) => {
    try {
      const response = await apiService.getServiceCategory(id);
      return response;
    } catch (error) {
      console.error("Error fetching service category:", error);
      throw error;
    }
  },

  // Get services by category
  getServicesByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiService.getServicesByCategory(
        categoryId,
        params,
      );
      return response;
    } catch (error) {
      console.error("Error fetching services by category:", error);
      throw error;
    }
  },

  // Create new service category (admin only)
  createServiceCategory: async (categoryData) => {
    try {
      const response = await apiService.post(
        "/service-categories",
        categoryData,
      );
      return response;
    } catch (error) {
      console.error("Error creating service category:", error);
      throw error;
    }
  },

  // Update service category (admin only)
  updateServiceCategory: async (id, categoryData) => {
    try {
      const response = await apiService.put(
        `/service-categories/${id}`,
        categoryData,
      );
      return response;
    } catch (error) {
      console.error("Error updating service category:", error);
      throw error;
    }
  },

  // Delete service category (admin only)
  deleteServiceCategory: async (id) => {
    try {
      const response = await apiService.delete(`/service-categories/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting service category:", error);
      throw error;
    }
  },

  // Get featured service categories
  getFeaturedServiceCategories: async () => {
    try {
      const response = await apiService.get("/service-categories/featured");
      return response;
    } catch (error) {
      console.error("Error fetching featured service categories:", error);
      throw error;
    }
  },

  // Get subcategories of a service category
  getSubcategories: async (categoryId) => {
    try {
      const response = await apiService.get(
        `/service-categories/${categoryId}/subcategories`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  },

  // Get public service categories (for homepage) - using Admin backend since User backend is broken
  getPublicServiceCategories: async () => {
    try {
      console.log("🔍 ServiceCategoryService: Fetching from Admin backend...");
      console.log(
        "🔍 ServiceCategoryService: SERVICE_CATEGORY_API_URL:",
        SERVICE_CATEGORY_API_URL,
      );
      const response = await api.get(
        "/service-categories/public?homeCategory=true&status=active",
      );
      console.log("✅ ServiceCategoryService: Raw response:", response);
      console.log("✅ ServiceCategoryService: Response data:", response?.data);
      console.log("✅ ServiceCategoryService: Response type:", typeof response);
      return response;
    } catch (error) {
      console.error(
        "❌ ServiceCategoryService: Error fetching public service categories:",
        error,
      );
      throw error;
    }
  },

  // Get popular service categories
  getPopularServiceCategories: async () => {
    try {
      const response = await apiService.get("/service-categories/popular");
      return response;
    } catch (error) {
      console.error("Error fetching popular service categories:", error);
      throw error;
    }
  },

  // Get service category with pricing info
  getServiceCategoryWithPricing: async (id) => {
    try {
      const response = await apiService.get(
        `/service-categories/${id}/pricing`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching service category pricing:", error);
      throw error;
    }
  },
};

export default serviceCategoryService;

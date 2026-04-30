// API Service for Admin frontend
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://admin-api.apnadecoration.com/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method with error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get auth token from localStorage
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.log("🔐 Authentication failed - clearing expired token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Trigger a page reload to redirect to login
        window.location.href = "/login";
        throw new Error("Authentication expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get product by ID
  async getProduct(id) {
    try {
      console.log("🔍 Fetching product with ID:", id);

      // First try admin backend
      try {
        const response = await this.request(`/products/${id}`);
        console.log("🔍 Admin backend response:", response);
        const product = response.data || response.product || response;
        console.log("🔍 Extracted product from admin:", product);
        return product;
      } catch (adminError) {
        console.log(
          "🔍 Admin backend failed, trying vendor backend:",
          adminError.message,
        );

        // Try vendor backend if admin fails
        const vendorAPI = "https://admin-api.apnadecoration.com/api"; // Update if vendor has different URL
        const token = localStorage.getItem("token");

        const response = await fetch(`${vendorAPI}/vendor-products/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(
            `Vendor API Error: ${response.status} - ${response.statusText}`,
          );
        }

        const vendorResponse = await response.json();
        console.log("🔍 Vendor backend response:", vendorResponse);
        const product =
          vendorResponse.data || vendorResponse.product || vendorResponse;
        console.log("🔍 Extracted product from vendor:", product);
        return product;
      }
    } catch (error) {
      console.error("Failed to fetch product from both backends:", error);
      throw error;
    }
  }

  // Get all products
  async getProducts() {
    try {
      console.log("Making API request to /products...");
      const response = await this.request("/products");
      console.log("Raw API response:", response);
      // Handle different response formats
      const products = Array.isArray(response)
        ? response
        : response.data || response.products || [];
      console.log("Extracted products:", products);
      console.log("Products length:", products.length);
      return products;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  }

  // Create product
  async createProduct(productData) {
    try {
      const response = await this.request("/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      return response.product || response;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const response = await this.request(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
      return response.product || response;
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await this.request(`/products/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  }

  // Toggle product featured status
  async toggleProductFeatured(id) {
    try {
      const response = await this.request(`/products/${id}/toggle-featured`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Failed to toggle featured:", error);
      throw error;
    }
  }

  // Get categories
  async getCategories() {
    try {
      const response = await this.request("/categories");
      return response.categories || response.data || response || [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }

  // Get brands
  async getBrands() {
    try {
      const response = await this.request("/products/brands");
      return response.brands || response || [];
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      throw error;
    }
  }

  // Create product with files
  async createProductWithFiles(productData, files) {
    try {
      const formData = new FormData();

      // Add product data as JSON string
      formData.append("productData", JSON.stringify(productData));

      // Add files if they exist
      if (files.thumbnail) {
        formData.append("thumbnail", files.thumbnail);
      }

      if (files.additional_images && files.additional_images.length > 0) {
        files.additional_images.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (files.meta_image) {
        formData.append("meta_image", files.meta_image);
      }

      // Get auth token
      const token = localStorage.getItem("token");
      const headers = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // Don't set Content-Type header - let browser set it with boundary

      const url = `${this.baseURL}/products`;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.log("🔐 Authentication failed - clearing expired token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Trigger a page reload to redirect to login
        window.location.href = "/login";
        throw new Error("Authentication expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create product with files:", error);
      throw error;
    }
  }

  // Update product with files
  async updateProductWithFiles(id, productData, files) {
    try {
      console.log("🔧 UPDATE PRODUCT DEBUG:");
      console.log("🔧 Product ID:", id);
      console.log("🔧 Product Data:", productData);
      console.log("🔧 Files:", files);

      const formData = new FormData();

      // Add product data as JSON string
      formData.append("productData", JSON.stringify(productData));
      console.log("🔧 FormData - productData added");

      // Add files if they exist
      const allFiles = [];

      // Add thumbnail first (if exists)
      if (files.thumbnail) {
        allFiles.push(files.thumbnail);
        console.log("🔧 Added thumbnail to files array");
      }

      // Add additional images
      if (files.additional_images && files.additional_images.length > 0) {
        allFiles.push(...files.additional_images);
        console.log(
          "🔧 Added additional images to files array:",
          files.additional_images.length,
          "files",
        );
      }

      // Add meta image
      if (files.meta_image) {
        allFiles.push(files.meta_image);
        console.log("🔧 Added meta image to files array");
      }

      // Add all files under 'images' field (backend expects this)
      allFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (allFiles.length > 0) {
        console.log("🔧 FormData - images added:", allFiles.length, "files");
      }

      // Get auth token
      const token = localStorage.getItem("token");
      const headers = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("🔧 Auth token added");
      }
      // Don't set Content-Type header - let browser set it with boundary

      const url = `${this.baseURL}/products/${id}`;
      console.log("🔧 Making PUT request to:", url);
      console.log("🔧 FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(
          "🔧   ",
          key,
          value instanceof File ? `File: ${value.name}` : value,
        );
      }

      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: formData,
      });

      console.log("🔧 Response status:", response.status);
      console.log("🔧 Response ok:", response.ok);

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.log("🔐 Authentication failed - clearing expired token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Trigger a page reload to redirect to login
        window.location.href = "/login";
        throw new Error("Authentication expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🔧 Error response body:", errorText);
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update product with files:", error);
      throw error;
    }
  }

  // Flash Deals API Methods
  async getFlashDeals(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(
        `/flash-deals${queryString ? "?" + queryString : ""}`,
      );
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch flash deals:", error);
      throw error;
    }
  }

  async getFlashDealById(id) {
    try {
      const response = await this.request(`/flash-deals/${id}`);
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch flash deal:", error);
      throw error;
    }
  }

  async createFlashDeal(formData, imageFile) {
    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "products" && Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image file if provided
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await fetch(`${this.baseURL}/flash-deals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create flash deal");
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Failed to create flash deal:", error);
      throw error;
    }
  }

  async updateFlashDeal(id, formData, imageFile) {
    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "products" && Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image file if provided
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await fetch(`${this.baseURL}/flash-deals/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update flash deal");
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("Failed to update flash deal:", error);
      throw error;
    }
  }

  async deleteFlashDeal(id) {
    try {
      const response = await this.request(`/flash-deals/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Failed to delete flash deal:", error);
      throw error;
    }
  }

  async toggleFlashDealPublish(id) {
    try {
      const response = await this.request(`/flash-deals/${id}/toggle-publish`, {
        method: "PATCH",
      });
      return response.data || response;
    } catch (error) {
      console.error("Failed to toggle flash deal publish status:", error);
      throw error;
    }
  }

  async getActiveFlashDeals() {
    try {
      const response = await this.request("/flash-deals/active");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch active flash deals:", error);
      throw error;
    }
  }

  async addProductToFlashDeal(flashDealId, productData) {
    try {
      const response = await this.request(
        `/flash-deals/${flashDealId}/products`,
        {
          method: "POST",
          body: JSON.stringify(productData),
        },
      );
      return response.data || response;
    } catch (error) {
      console.error("Failed to add product to flash deal:", error);
      throw error;
    }
  }

  async removeProductFromFlashDeal(flashDealId, productId) {
    try {
      const response = await this.request(
        `/flash-deals/${flashDealId}/products/${productId}`,
        {
          method: "DELETE",
        },
      );
      return response.data || response;
    } catch (error) {
      console.error("Failed to remove product from flash deal:", error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

import apiService from "./api";
import { cachedApiCall } from "../utils/apiCache";

const addressService = {
  // Get all user addresses (with caching)
  getAddresses: async () => {
    return cachedApiCall("addresses", async () => {
      try {
        const response = await apiService.getAddresses();
        return response;
      } catch (error) {
        console.error("Error fetching addresses:", error);
        throw error;
      }
    });
  },

  // Get address by ID
  getAddress: async (id) => {
    try {
      const response = await apiService.getAddress(id);
      return response;
    } catch (error) {
      console.error("Error fetching address:", error);
      throw error;
    }
  },

  // Create new address
  createAddress: async (addressData) => {
    try {
      console.log("=== API SERVICE HIT ===");
      console.log("addressService.createAddress called with:", addressData);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("Request timeout - API took too long to respond")),
          5000, // Reduced to 5 seconds
        ),
      );

      const apiPromise = apiService.createAddress(addressData);

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log("addressService.createAddress response:", response);

      return response;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (id, addressData) => {
    try {
      const response = await apiService.updateAddress(id, addressData);
      return response;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      const response = await apiService.deleteAddress(id);
      return response;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  // Set default address
  setDefaultAddress: async (id) => {
    try {
      const response = await apiService.setDefaultAddress(id);
      return response;
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },

  // Get default address
  getDefaultAddress: async () => {
    try {
      const response = await apiService.get("/addresses/default");
      return response;
    } catch (error) {
      console.error("Error fetching default address:", error);
      throw error;
    }
  },

  // Validate address
  validateAddress: async (addressData) => {
    try {
      const response = await apiService.post(
        "/addresses/validate",
        addressData,
      );
      return response;
    } catch (error) {
      console.error("Error validating address:", error);
      throw error;
    }
  },

  // Get address suggestions (autocomplete)
  getAddressSuggestions: async (query) => {
    try {
      const response = await apiService.get("/addresses/suggestions", {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      throw error;
    }
  },

  // Calculate shipping cost for address
  calculateShippingCost: async (addressId, cartItems) => {
    try {
      const response = await apiService.post(
        `/addresses/${addressId}/shipping-cost`,
        {
          cartItems,
        },
      );
      return response;
    } catch (error) {
      console.error("Error calculating shipping cost:", error);
      throw error;
    }
  },

  // Check if address is in serviceable area
  checkServiceability: async (addressData) => {
    try {
      const response = await apiService.post(
        "/addresses/check-serviceability",
        addressData,
      );
      return response;
    } catch (error) {
      console.error("Error checking address serviceability:", error);
      throw error;
    }
  },
};

export default addressService;

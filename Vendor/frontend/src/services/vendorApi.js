// VendorApiService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://admin-api.apnadecoration.com/api';

class VendorApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth headers
  getAuthHeaders(isJson = true) {
    // Vendor frontend must use vendorToken, not regular user token
    const token = localStorage.getItem('vendorToken');
    
    if (!token) {
      console.error('❌ No vendorToken found in localStorage');
      console.error('❌ Available keys:', Object.keys(localStorage));
    }
    
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(options.isJson !== false),
    };

    console.log('🔍 Vendor API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      hasToken: !!config.headers.Authorization
    });

    try {
      const response = await fetch(url, {
        ...config,
        ...options,
        body: options.body
      });

      console.log('🔍 Vendor API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Vendor API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Vendor API request failed:', error);
      throw error;
    }
  }

  // ====== Vendor Endpoints ======

  // Get all vendor products
  async getVendorProducts() {
    return this.request('/vendor-products/my-products');
  }

  // Get categories for product creation
  async getCategories() {
    return this.request('/categories'); // This should work - calling user backend categories
  }

  // Create new vendor product (JSON or FormData)
  async createVendorProduct(productData) {
    // Check if productData is FormData
    if (productData instanceof FormData) {
      const headers = this.getAuthHeaders(false);
      delete headers['Content-Type']; // Let browser set it for FormData
      
      const response = await fetch(`${this.baseURL}/vendor-products`, {
        method: 'POST',
        headers,
        body: productData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    }
    
    // JSON request
    return this.request('/vendor-products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  // Create vendor product with files (FormData)
  async createVendorProductWithFiles(productData, files) {
    try {
      const formData = new FormData();
      
      // Send individual fields instead of nested productData
      formData.append('name', productData.name);
      formData.append('sku', productData.sku);
      formData.append('price', productData.unit_price); // Changed from unit_price to price
      formData.append('brand', productData.brand);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      
      // Add vendor field temporarily for debugging
      const token = localStorage.getItem('token');
      console.log('🔐 Token from localStorage:', token ? 'exists' : 'missing');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 Token payload:', payload);
          const vendorId = payload.userId || payload.id;
          console.log('🆔 Extracted vendor ID:', vendorId);
          
          if (vendorId) {
            formData.append('vendor', vendorId);
            console.log('✅ Vendor field added to FormData');
          } else {
            console.log('❌ No vendor ID found in token payload');
          }
        } catch (e) {
          console.log('❌ Could not extract vendor ID from token:', e.message);
        }
      }
      
      // Add images
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('images', file));
      }

      // Debug: Log FormData contents
      console.log('📋 FormData contents before sending:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }

      const headers = this.getAuthHeaders(false); // do not set Content-Type, let browser handle FormData

      const response = await fetch(`${this.baseURL}/vendor-products`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vendor API Error Response (Files):', errorText);

        if (errorText.includes('<!DOCTYPE')) {
          throw new Error('Server returned HTML error page - check backend logs');
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to create vendor product with files:', error);
      throw error;
    }
  }

  // Update vendor product
  async updateVendorProduct(id, productData) {
    return this.request(`/vendor-products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  // Update vendor product with files (FormData)
  async updateVendorProductWithFiles(id, productData, files, removedImages = []) {
    try {
      const formData = new FormData();
      
      // Send individual fields instead of nested productData
      formData.append('name', productData.name);
      formData.append('sku', productData.sku);
      formData.append('price', productData.unit_price);
      formData.append('brand', productData.brand);
      formData.append('category', productData.category);
      formData.append('description', productData.description);
      
      // Add removed images as JSON string
      if (removedImages && removedImages.length > 0) {
        formData.append('removedImages', JSON.stringify(removedImages));
        console.log('🗑️ Sending removed images:', removedImages);
      }
      
      // Add new images
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('images', file));
      }

      const headers = this.getAuthHeaders(false); // do not set Content-Type, let browser handle FormData

      console.log('🔍 Updating vendor product with files:', {
        id,
        fields: Object.keys(productData),
        imageCount: files?.length || 0,
        removedImageCount: removedImages?.length || 0
      });

      console.log('🔍 Making request to:', `${this.baseURL}/vendor-products/${id}/files`);
      console.log('🔍 Request method: PUT');
      console.log('🔍 Headers:', headers);
      console.log('🔍 FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await fetch(`${this.baseURL}/vendor-products/${id}/files`, {
        method: 'PUT',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vendor API Error Response (Update Files):', errorText);

        if (errorText.includes('<!DOCTYPE')) {
          throw new Error('Server returned HTML error page - check backend logs');
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to update vendor product with files:', error);
      throw error;
    }
  }

  // Get single vendor product
  async getVendorProduct(id) {
    return this.request(`/vendor-products/${id}`);
  }

  // Delete vendor product
  async deleteVendorProduct(id) {
    return this.request(`/vendor-products/${id}`, {
      method: 'DELETE'
    });
  }

  // Get vendor orders
  async getVendorOrders() {
    return this.request('/vendor-orders');
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    return this.request(`/vendor-orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

const vendorApiService = new VendorApiService();
export default vendorApiService;

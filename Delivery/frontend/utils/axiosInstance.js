import axios from 'axios';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-api.apnadecoration.com/api';

/**
 * Create axios instance with interceptors for handling auth errors
 */
export const createAxiosInstance = (router = null) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add token to every request
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('deliveryBoyToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle 401 errors
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Clear tokens and user data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('deliveryBoyToken');
          localStorage.removeItem('deliveryBoyUser');
        }

        // Redirect to login if we have a router instance
        if (router) {
          router.push('/auth/login');
        } else if (typeof window !== 'undefined') {
          // Fallback redirect using window.location
          window.location.href = '/auth/login';
        }

        // Reject with a clear error message
        return Promise.reject({
          status: 401,
          message: 'Your session has expired. Please log in again.',
          error: error.response?.data?.message || 'Unauthorized',
        });
      }

      // Handle other HTTP errors
      if (error.response?.status === 403) {
        return Promise.reject({
          status: 403,
          message: 'You do not have permission to access this resource.',
          error: error.response?.data?.message || 'Forbidden',
        });
      }

      if (error.response?.status === 500) {
        return Promise.reject({
          status: 500,
          message: 'Server error. Please try again later.',
          error: error.response?.data?.message || 'Server Error',
        });
      }

      // Handle network errors
      if (!error.response) {
        return Promise.reject({
          status: 0,
          message: 'Cannot reach the server. Please check your internet connection.',
          error: error.message || 'Network Error',
        });
      }

      // Other errors
      return Promise.reject({
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'An error occurred',
        error: error.response?.data || error.message,
      });
    }
  );

  return instance;
};

// Create a global axios instance (for use without router)
export const axiosInstance = createAxiosInstance();

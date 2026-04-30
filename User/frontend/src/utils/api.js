import axios from "axios";
import { API_BASE_URL } from "../config/constants";

// Use environment variable for API URL
const API_BASE_URL_FINAL = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL_FINAL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data, // ✅ FIX: Return response.data instead of full response
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

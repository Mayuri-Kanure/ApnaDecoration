import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const API_BASE_URL_FINAL = `${API_BASE_URL}/api`;

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("🔑 Token from localStorage:", token ? "Present" : "Missing");

  if (!token) {
    console.warn("⚠️ No authentication token found");
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Support Ticket Service
export const supportTicketService = {
  // Get user's support tickets
  getUserTickets: async (page = 1, limit = 20, status = "") => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(
        `${API_BASE_URL_FINAL}/support-tickets/user?page=${page}&limit=${limit}&status=${status}&_t=${timestamp}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      throw error;
    }
  },

  // Get all support tickets (admin)
  getAllTickets: async (
    page = 1,
    limit = 20,
    status = "",
    category = "",
    priority = "",
    search = "",
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(search && { search }),
      });

      const response = await axios.get(
        `${API_BASE_URL_FINAL}/support-tickets/admin/all?${params}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      throw error;
    }
  },

  // Get single support ticket
  getTicketById: async (ticketId) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await axios.get(
        `${API_BASE_URL_FINAL}/support-tickets/${ticketId}?_t=${timestamp}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw error;
    }
  },

  // Create new support ticket
  createTicket: async (ticketData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL_FINAL}/support-tickets`,
        ticketData,
        {
          headers: getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  // Add reply to support ticket
  addReply: async (ticketId, message) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL_FINAL}/support-tickets/${ticketId}/reply`,
        {
          message,
        },
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL_FINAL}/support-tickets/${ticketId}/status`,
        {
          status,
        },
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  },

  // Delete support ticket (admin only)
  deleteTicket: async (ticketId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL_FINAL}/support-tickets/${ticketId}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  },
};

// Support Dashboard Service
export const supportDashboardService = {
  // Get ticket statistics
  getTicketStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL_FINAL}/support-dashboard/stats`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      throw error;
    }
  },

  // Get recent tickets
  getRecentTickets: async (limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL_FINAL}/support-dashboard/recent?limit=${limit}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recent tickets:", error);
      throw error;
    }
  },
};

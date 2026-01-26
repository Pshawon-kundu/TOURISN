import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const adminAPI = {
  // Auth
  login: (email: string, password: string) =>
    api.post("/admin/login", { email, password }),

  logout: () => api.post("/admin/logout"),

  getMe: () => api.get("/admin/me"),

  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  // Users
  getUsers: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/admin/users", { params }),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  approveUser: (id: string, status: "approved" | "rejected", reason?: string) =>
    api.post(`/admin/users/${id}/approve`, { status, reason }),

  blockUser: (id: string, action: "block" | "unblock", reason?: string) =>
    api.post(`/admin/users/${id}/block`, { action, reason }),

  // Bookings
  getBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get("/admin/bookings", { params }),

  // Billing
  getBilling: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/billing", { params }),

  // Activity Logs
  getActivityLogs: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/activity-logs", { params }),
};

export const guideAPI = {
  loginWithNid: (nid: string) => api.post("/guides/login-with-nid", { nid }),
};

export default api;

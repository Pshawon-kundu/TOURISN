import { Platform } from "react-native";

// API Configuration
const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5001/api"
    : "http://10.0.2.2:5001/api"; // For Android emulator

export class APIClient {
  private baseURL: string = API_BASE_URL;
  private token: string | null = null;

  /**
   * Set authentication token for API requests
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Build request headers with auth token
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Add user email for session management
    if (typeof window !== "undefined") {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        headers["X-User-Email"] = userEmail;
      }
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with method specification
   */
  private async doRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new Error(
          `Cannot connect to server at ${this.baseURL}. Make sure the backend is running on port 5001.`
        );
      }
      throw error;
    }
  }

  /**
   * Generic request method (supports all HTTP methods)
   */
  async request<T>({
    method = "GET",
    endpoint,
    body,
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    endpoint: string;
    body?: any;
  }): Promise<T> {
    const options: RequestInit = { method };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return this.doRequest<T>(endpoint, options);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.doRequest<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.doRequest<T>(endpoint, { method: "DELETE" });
  }

  // ===== AUTH ENDPOINTS =====
  async signup(email: string, password: string, role: string) {
    return this.post("/auth/signup", { email, password, role });
  }

  async login(email: string, password: string) {
    return this.post("/auth/login", { email, password });
  }

  async getCurrentUser() {
    return this.get("/auth/me");
  }

  // ===== EXPERIENCES ENDPOINTS =====
  async getExperiences(page: number = 1, limit: number = 10) {
    return this.get(`/experiences?page=${page}&limit=${limit}`);
  }

  async getExperienceById(id: string) {
    return this.get(`/experiences/${id}`);
  }

  async createExperience(data: any) {
    return this.post("/experiences", data);
  }

  async updateExperience(id: string, data: any) {
    return this.patch(`/experiences/${id}`, data);
  }

  async deleteExperience(id: string) {
    return this.delete(`/experiences/${id}`);
  }

  // ===== BOOKINGS ENDPOINTS =====
  async getBookings(page: number = 1, limit: number = 10) {
    return this.get(`/bookings?page=${page}&limit=${limit}`);
  }

  async getBookingById(id: string) {
    return this.get(`/bookings/${id}`);
  }

  async createBooking(data: any) {
    return this.post("/bookings", data);
  }

  async updateBooking(id: string, data: any) {
    return this.patch(`/bookings/${id}`, data);
  }

  async cancelBooking(id: string) {
    return this.patch(`/bookings/${id}`, { bookingStatus: "cancelled" });
  }

  // ===== GUIDES ENDPOINTS =====
  async getGuides(page: number = 1, limit: number = 10) {
    return this.get(`/guides?page=${page}&limit=${limit}`);
  }

  async getGuideById(id: string) {
    return this.get(`/guides/${id}`);
  }

  async createGuideProfile(data: any) {
    return this.post("/guides", data);
  }

  async updateGuideProfile(id: string, data: any) {
    return this.patch(`/guides/${id}`, data);
  }

  // ===== REVIEWS ENDPOINTS =====
  async getReviews(experienceId: string, page: number = 1, limit: number = 10) {
    return this.get(
      `/reviews?experienceId=${experienceId}&page=${page}&limit=${limit}`
    );
  }

  async createReview(data: any) {
    return this.post("/reviews", data);
  }

  async updateReview(id: string, data: any) {
    return this.patch(`/reviews/${id}`, data);
  }

  async deleteReview(id: string) {
    return this.delete(`/reviews/${id}`);
  }

  // ===== STAYS ENDPOINTS =====
  async createStayBooking(data: any) {
    return this.post("/stays", data);
  }

  async getStayBookings(page: number = 1, limit: number = 10) {
    return this.get(`/stays?page=${page}&limit=${limit}`);
  }

  // ===== TRANSPORT ENDPOINTS =====
  async createTransportBooking(data: any) {
    return this.post("/transport", data);
  }

  async getTransportBookings(page: number = 1, limit: number = 10) {
    return this.get(`/transport?page=${page}&limit=${limit}`);
  }

  // ===== SETTINGS ENDPOINTS =====
  async getSettings() {
    return this.get("/settings");
  }

  async updateSettings(data: {
    notifications_enabled?: boolean;
    location_enabled?: boolean;
    dark_mode_enabled?: boolean;
    language?: string;
    currency?: string;
  }) {
    return this.put("/settings", data);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post("/settings/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async getPaymentMethods() {
    return this.get("/settings/payment-methods");
  }

  async addPaymentMethod(data: {
    type: string;
    last_four: string;
    card_brand?: string;
    expiry_month?: number;
    expiry_year?: number;
  }) {
    return this.post("/settings/payment-methods", data);
  }

  async deletePaymentMethod(id: string) {
    return this.delete(`/settings/payment-methods/${id}`);
  }

  async clearCache() {
    return this.post("/settings/clear-cache", {});
  }

  async deleteAccount() {
    return this.request({
      method: "DELETE",
      endpoint: "/settings/account",
      body: { confirmation: "DELETE" },
    });
  }

  async getAppInfo() {
    return this.get("/settings/app-info");
  }
}

// Export singleton instance
export const api = new APIClient();

// Export base URL for reference
export { API_BASE_URL };

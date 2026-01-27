// API configuration and utilities
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001/api";
  }
  return "http://localhost:5001/api";
};

const API_BASE_URL = getApiBaseUrl();

interface BookingData {
  transportType?: "car" | "bus" | "bike" | "boat";
  from?: string;
  to?: string;
  propertyName?: string;
  propertyType?: "hotel" | "resort" | "apartment" | "villa" | "hostel";
  location?: string;
  travelerName: string;
  phone: string;
  email: string;
  notes?: string;
  baseFare: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  cardLastFour?: string;
  userId: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  numberOfNights?: number;
  travelDate?: string;
  duration?: string;
}

export const createTransportBooking = async (
  bookingData: BookingData,
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking");
    }

    return data;
  } catch (error) {
    console.error("Error creating transport booking:", error);
    throw error;
  }
};

export const createStayBooking = async (
  bookingData: BookingData,
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking");
    }

    return data;
  } catch (error) {
    console.error("Error creating stay booking:", error);
    throw error;
  }
};

export const getAllTransportBookings = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transport`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch bookings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching transport bookings:", error);
    throw error;
  }
};

export const getAllStayBookings = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stays`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch bookings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching stay bookings:", error);
    throw error;
  }
};

export const processPayment = async (
  bookingId: string,
  paymentData: {
    payment_method: string;
    payment_number?: string;
    transaction_id?: string;
  },
  authToken: string,
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/transport/${bookingId}/payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          ...paymentData,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process payment");
    }

    return data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export default {
  createTransportBooking,
  createStayBooking,
  getAllTransportBookings,
  getAllStayBookings,
  processPayment,
};

// Food API Functions
export const getAllFoodItems = async (params?: {
  category?: string;
  region?: string;
  search?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.region) queryParams.append("region", params.region);
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_BASE_URL}/food/items${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch food items");
    }

    return data;
  } catch (error) {
    console.error("Error fetching food items:", error);
    throw error;
  }
};

export const getFoodItemById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/food/items/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch food item");
    }

    return data;
  } catch (error) {
    console.error("Error fetching food item:", error);
    throw error;
  }
};

export const getAllRestaurants = async (params?: {
  district?: string;
  cuisine?: string;
  search?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.district) queryParams.append("district", params.district);
    if (params?.cuisine) queryParams.append("cuisine", params.cuisine);
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_BASE_URL}/food/restaurants${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch restaurants");
    }

    return data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

export const getRestaurantById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/food/restaurants/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch restaurant");
    }

    return data;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};

// Experience API Functions
export const getAllExperiences = async (params?: {
  category?: string;
  location?: string;
  search?: string;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.location) queryParams.append("location", params.location);
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_BASE_URL}/experiences${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch experiences");
    }

    return data;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    throw error;
  }
};

export const getExperienceById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/experiences/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch experience");
    }

    return data;
  } catch (error) {
    console.error("Error fetching experience:", error);
    throw error;
  }
};

// Guide API Functions
export const getAllGuides = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/guides`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch guides");
    }

    return data;
  } catch (error) {
    console.error("Error fetching guides:", error);
    throw error;
  }
};

// Featured Trips API
export const getFeaturedTrips = async (limit?: number): Promise<any> => {
  try {
    const url = limit
      ? `${API_BASE_URL}/experiences/featured?limit=${limit}`
      : `${API_BASE_URL}/experiences/featured`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch featured trips");
    }

    return data;
  } catch (error) {
    console.error("Error fetching featured trips:", error);
    throw error;
  }
};

// Get experiences by category for Find Experiences page
export const getExperiencesByCategory = async (params?: {
  category?: string;
  sortBy?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_BASE_URL}/experiences/category${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch experiences");
    }

    return data;
  } catch (error) {
    console.error("Error fetching experiences by category:", error);
    throw error;
  }
};

// Seed experiences data
export const seedExperiences = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/experiences/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to seed experiences");
    }

    return data;
  } catch (error) {
    console.error("Error seeding experiences:", error);
    throw error;
  }
};

// Combined Booking (Room + Guide + Experience)
export interface CombinedBookingData {
  // User info
  userId?: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  specialRequests?: string;

  // Experience details
  experienceId?: string;
  experienceName?: string;
  experienceCategory?: string;
  experienceLocation?: string;
  experienceDuration?: string;
  experiencePrice?: number;

  // Stay/Room details
  roomType?: string;
  roomPricePerNight?: number;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfNights?: number;

  // Guide details
  guideId?: string;
  guideName?: string;
  guideRatePerHour?: number;
  guideHours?: number;

  // Travel details
  fromLocation?: string;
  toLocation?: string;
  travelDate?: string;
  numberOfTravelers?: number;

  // Payment
  paymentMethod?: string;
  cardLastFour?: string;
}

export const createCombinedBooking = async (
  bookingData: CombinedBookingData,
): Promise<any> => {
  try {
    console.log("📡 Creating combined booking...");
    const response = await fetch(`${API_BASE_URL}/combined-bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create combined booking");
    }

    console.log("✅ Combined booking created:", data);
    return data;
  } catch (error) {
    console.error("Error creating combined booking:", error);
    throw error;
  }
};

export const getCombinedBookingByReference = async (
  reference: string,
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/combined-bookings/reference/${reference}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch booking");
    }

    return data;
  } catch (error) {
    console.error("Error fetching combined booking:", error);
    throw error;
  }
};

export const createExperienceBooking = async (
  bookingData: BookingData,
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/experience`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create booking");
    }

    return data;
  } catch (error) {
    console.error("Error creating experience booking:", error);
    throw error;
  }
};

// Districts API Functions
export const getAllDistricts = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/districts`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch districts");
    }

    return data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
};

export const getDistrictById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/districts/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch district");
    }

    return data;
  } catch (error) {
    console.error("Error fetching district:", error);
    throw error;
  }
};

export const searchDistricts = async (query: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/districts/search?q=${encodeURIComponent(query)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to search districts");
    }

    return data;
  } catch (error) {
    console.error("Error searching districts:", error);
    throw error;
  }
};

// Guide API Functions
export const registerGuide = async (
  guideData: any,
  authToken: string,
): Promise<any> => {
  try {
    console.log("📡 registerGuide API call starting...");
    console.log("API URL:", `${API_BASE_URL}/guides/register`);
    console.log("Auth token length:", authToken.length);
    console.log("Guide data keys:", Object.keys(guideData));

    const response = await fetch(`${API_BASE_URL}/guides/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(guideData),
    });

    console.log("📥 Response received, status:", response.status);

    const data = await response.json();
    console.log("📄 Response data:", data);

    if (!response.ok) {
      console.error("❌ API returned error:", data.error);
      throw new Error(data.error || "Failed to register guide");
    }

    console.log("✅ registerGuide API call successful!");
    return data;
  } catch (error) {
    console.error("❌ Error in registerGuide API:", error);
    console.error("Error type:", typeof error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

// APIClient class for compatibility with existing imports
export class APIClient {
  private baseURL: string = API_BASE_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async doRequest<T>(
    endpoint: string,
    options: RequestInit = {},
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
          `Cannot connect to server at ${this.baseURL}. Make sure the backend is running on port 5001.`,
        );
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.doRequest<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.doRequest<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.doRequest<T>(endpoint, { method: "DELETE" });
  }

  async registerGuide(data: any) {
    return registerGuide(data);
  }

  async getGuides(page: number = 1, limit: number = 10) {
    return getAllGuides();
  }
}

// Export singleton instance for compatibility
export const api = new APIClient();

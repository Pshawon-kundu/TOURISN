// API configuration and utilities
const API_BASE_URL = "http://localhost:5001/api";

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
  bookingData: BookingData
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
  bookingData: BookingData
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
  authToken: string
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
      }
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

export const createExperienceBooking = async (
  bookingData: BookingData
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
      `${API_BASE_URL}/districts/search?q=${encodeURIComponent(query)}`
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

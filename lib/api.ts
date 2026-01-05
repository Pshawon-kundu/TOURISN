// API configuration and utilities
const API_BASE_URL = "http://localhost:5000/api";

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

export default {
  createTransportBooking,
  createStayBooking,
  getAllTransportBookings,
  getAllStayBookings,
};

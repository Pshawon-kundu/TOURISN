// API helper for guide-web to communicate with backend
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getAuthToken(): Promise<string | null> {
  // Get the Supabase session token
  const { supabase } = await import("../config/supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();
    console.log("API GET:", endpoint, "Token:", token ? "present" : "missing");

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    console.log("API Response:", endpoint, data);
    return data;
  } catch (error) {
    console.error("API GET error:", error);
    return { success: false, error: "Network error" };
  }
}

export async function apiPost<T>(
  endpoint: string,
  body: any,
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API POST error:", error);
    return { success: false, error: "Network error" };
  }
}

// Chat API functions
export async function fetchChatRooms() {
  return apiGet<any[]>("/chat/rooms");
}

export async function fetchChatMessages(roomId: string) {
  return apiGet<any[]>(`/chat/messages/${roomId}`);
}

export async function sendChatMessage(roomId: string, message: string) {
  return apiPost<any>("/chat/message", { roomId, message });
}

// Bookings API functions
export async function fetchGuideBookings() {
  return apiGet<any[]>("/bookings/guide");
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled",
) {
  return apiPost<any>(`/bookings/${bookingId}/status`, { status });
}

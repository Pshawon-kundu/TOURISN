import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001/api";
  }
  return "http://localhost:5001/api";
};

const API_BASE_URL = getApiBaseUrl();

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  otherUser?: any;
  isGuideChat?: boolean;
  guideInfo?: any;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

export class ChatAPI {
  private static authToken: string | null = null;

  static setAuthToken(token: string) {
    this.authToken = token;
  }

  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {},
  ) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get or create a chat room with a guide
  static async getOrCreateChatRoom(guideId: string): Promise<ChatRoom> {
    const response = await this.makeRequest("/chat/room", {
      method: "POST",
      body: JSON.stringify({ guideId }),
    });
    return response.data;
  }

  // Send a message
  static async sendMessage(
    roomId: string,
    message: string,
    messageType = "text",
  ): Promise<ChatMessage> {
    const response = await this.makeRequest("/chat/message", {
      method: "POST",
      body: JSON.stringify({
        roomId,
        message,
        messageType,
      }),
    });
    return response.data;
  }

  // Get messages for a room
  static async getChatMessages(
    roomId: string,
    page = 1,
    limit = 50,
  ): Promise<{
    data: ChatMessage[];
    pagination: any;
  }> {
    const response = await this.makeRequest(
      `/chat/messages/${roomId}?page=${page}&limit=${limit}`,
    );
    return response;
  }

  // Get all chat rooms for the user
  static async getUserChatRooms(): Promise<ChatRoom[]> {
    const response = await this.makeRequest("/chat/rooms");
    return response.data;
  }

  // Mark messages as read
  static async markMessagesAsRead(roomId: string): Promise<void> {
    await this.makeRequest("/chat/mark-read", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    });
  }

  // Real-time message polling (fallback when WebSocket not available)
  static startMessagePolling(
    roomId: string,
    callback: (messages: ChatMessage[]) => void,
    interval = 2000,
  ) {
    const poll = async () => {
      try {
        const { data: messages } = await this.getChatMessages(roomId, 1, 50);
        callback(messages);
      } catch (error) {
        console.warn("Polling error:", error);
      }
    };

    poll(); // Initial load
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }
}

// Helper function to format chat message time
export function formatChatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // More than 24 hours, show date
  return date.toLocaleDateString();
}

// Helper function to get display name
export function getDisplayName(
  user: { first_name?: string; last_name?: string } | undefined,
): string {
  if (!user) return "User";
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
}

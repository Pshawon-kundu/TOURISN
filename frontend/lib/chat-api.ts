const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5001";

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  user1?: any;
  user2?: any;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "file" | "location";
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: any;
}

// Get all chat rooms for a user
export const getChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${userId}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to fetch chat rooms");
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

// Get or create a chat room between two users
export const getOrCreateChatRoom = async (
  user1Id: string,
  user2Id: string
): Promise<ChatRoom> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user1_id: user1Id,
        user2_id: user2Id,
      }),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to create chat room");
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

// Get messages for a chat room
export const getChatMessages = async (
  roomId: string,
  limit: number = 50,
  before?: string
): Promise<ChatMessage[]> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(before && { before }),
    });

    const response = await fetch(
      `${BACKEND_URL}/api/chat/rooms/${roomId}/messages?${params}`
    );
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to fetch messages");
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Send a message
export const sendChatMessage = async (
  roomId: string,
  senderId: string,
  message: string,
  messageType: "text" | "image" | "file" | "location" = "text"
): Promise<ChatMessage> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: roomId,
        sender_id: senderId,
        message,
        message_type: messageType,
      }),
    });
    const data = await response.json();

    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to send message");
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  roomId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/messages/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: roomId,
        user_id: userId,
      }),
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to mark messages as read");
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/unread/${userId}`);
    const data = await response.json();

    if (data.success) {
      return data.data.unreadCount;
    }
    throw new Error(data.message || "Failed to get unread count");
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Delete a message
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/chat/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete message");
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

import { Response } from "express";
import { supabase } from "../config/supabase";
import { AuthRequest } from "../middleware/auth";

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create a chat room between user and guide
 * POST /api/chat/room
 */
export const getOrCreateChatRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { guideId } = req.body;
    const userId = req.user.id;

    if (!guideId) {
      res.status(400).json({ success: false, error: "Guide ID is required" });
      return;
    }

    // Check if guide exists
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("id, user_id")
      .eq("id", guideId)
      .single();

    if (guideError || !guide) {
      res.status(404).json({ success: false, error: "Guide not found" });
      return;
    }

    // Ensure user1_id is always the smaller ID for consistency
    const [user1Id, user2Id] = [userId, guide.user_id].sort();

    // Try to find existing room
    let { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("user1_id", user1Id)
      .eq("user2_id", user2Id)
      .single();

    // Create room if it doesn't exist
    if (roomError || !room) {
      const { data: newRoom, error: createError } = await supabase
        .from("chat_rooms")
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
        })
        .select()
        .single();

      if (createError) {
        console.error("Chat room creation error:", createError);
        res.status(400).json({ success: false, error: createError.message });
        return;
      }

      room = newRoom;
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get or create chat room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Send a message in a chat room
 * POST /api/chat/message
 */
export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { roomId, message, messageType = "text" } = req.body;
    const senderId = req.user.id;

    if (!roomId || !message) {
      res.status(400).json({
        success: false,
        error: "Room ID and message are required",
      });
      return;
    }

    // Verify user is part of this chat room
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .or(`user1_id.eq.${senderId},user2_id.eq.${senderId}`)
      .single();

    if (roomError || !room) {
      res.status(403).json({
        success: false,
        error: "Access denied or room not found",
      });
      return;
    }

    // Insert the message
    const { data: newMessage, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: senderId,
        message: message.trim(),
        message_type: messageType,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Message creation error:", messageError);
      res.status(400).json({ success: false, error: messageError.message });
      return;
    }

    // Update the chat room's last message
    await supabase
      .from("chat_rooms")
      .update({
        last_message: message.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", roomId);

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Get messages for a chat room
 * GET /api/chat/messages/:roomId
 */
export const getChatMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify user is part of this chat room
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (roomError || !room) {
      res.status(403).json({
        success: false,
        error: "Access denied or room not found",
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const {
      data: messages,
      error: messagesError,
      count,
    } = await supabase
      .from("chat_messages")
      .select(
        "*, sender:users!chat_messages_sender_id_fkey(first_name, last_name)",
        { count: "exact" }
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .range(skip, skip + Number(limit) - 1);

    if (messagesError) {
      console.error("Messages fetch error:", messagesError);
      res.status(400).json({ success: false, error: messagesError.message });
      return;
    }

    res.status(200).json({
      success: true,
      data: messages || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Get all chat rooms for a user
 * GET /api/chat/rooms
 */
export const getUserChatRooms = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    const { data: rooms, error: roomsError } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        user1:users!chat_rooms_user1_id_fkey(id, first_name, last_name, profile_image_url),
        user2:users!chat_rooms_user2_id_fkey(id, first_name, last_name, profile_image_url),
        guide1:guides!guides_user_id_fkey1(id, expertise_area, per_hour_rate, rating, is_verified),
        guide2:guides!guides_user_id_fkey2(id, expertise_area, per_hour_rate, rating, is_verified)
      `
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (roomsError) {
      console.error("Chat rooms fetch error:", roomsError);
      res.status(400).json({ success: false, error: roomsError.message });
      return;
    }

    // Process rooms to show the other participant
    const processedRooms = (rooms || []).map((room: any) => {
      const isUser1 = room.user1_id === userId;
      const otherUser = isUser1 ? room.user2 : room.user1;
      const otherGuideInfo = isUser1 ? room.guide2 : room.guide1;

      return {
        ...room,
        otherUser,
        isGuideChat: !!otherGuideInfo,
        guideInfo: otherGuideInfo || null,
      };
    });

    res.status(200).json({
      success: true,
      data: processedRooms,
    });
  } catch (error) {
    console.error("Get user chat rooms error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Mark messages as read
 * POST /api/chat/mark-read
 */
export const markMessagesAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { roomId } = req.body;
    const userId = req.user.id;

    if (!roomId) {
      res.status(400).json({ success: false, error: "Room ID is required" });
      return;
    }

    // Verify user is part of this chat room
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("id", roomId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (roomError || !room) {
      res.status(403).json({
        success: false,
        error: "Access denied or room not found",
      });
      return;
    }

    // Mark all messages in this room as read (except own messages)
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("room_id", roomId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (updateError) {
      console.error("Mark messages as read error:", updateError);
      res.status(400).json({ success: false, error: updateError.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

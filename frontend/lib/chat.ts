// Supabase Chat API
import { getSupabaseClient } from "./auth";

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "file" | "location";
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  other_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Get or create a chat room with a guide
export async function getOrCreateChatRoom(
  otherUserId: string,
): Promise<ChatRoom | null> {
  console.log("🔵 getOrCreateChatRoom called with:", otherUserId);

  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.error("❌ Supabase client not available");
    return null;
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("❌ Auth error:", authError);
    return null;
  }

  if (!user) {
    console.error("❌ No authenticated user");
    return null;
  }

  console.log("✅ Current user:", user.id);
  console.log("✅ Target user (provided):", otherUserId);

  // Always try to resolve guide ID to user ID first
  let targetUserId = otherUserId;

  // First attempt: Check if it's a guide ID
  const { data: guideData, error: guideError } = await supabase
    .from("guides")
    .select("user_id")
    .eq("id", otherUserId)
    .single();

  if (guideData && guideData.user_id) {
    console.log(
      `✅ Resolved guide ID ${otherUserId} → user ID ${guideData.user_id}`,
    );
    targetUserId = guideData.user_id;
  } else if (guideError && guideError.code !== "PGRST116") {
    console.log("⚠️ Error fetching guide:", guideError.message);
  }

  // Verify target user exists in users table (optional check)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", targetUserId)
    .single();

  if (!userData) {
    console.warn("⚠️ Target user not found in users table:", targetUserId);
    console.warn("   Error:", userError?.message);
    console.warn(
      "   Continuing anyway - room will be created if both users exist in auth...",
    );
  } else {
    console.log("✅ Target user verified:", targetUserId);
  }

  // Ensure user IDs are sorted to maintain consistency
  const [user1Id, user2Id] = [user.id, targetUserId].sort();
  console.log(`🔄 Looking for room: user1=${user1Id}, user2=${user2Id}`);

  // 1. Try to find existing room
  let { data: room, error } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("user1_id", user1Id)
    .eq("user2_id", user2Id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected
    console.error("❌ Error finding room:", error);
  }

  if (room) {
    console.log("✅ Existing room found:", room.id);
    return room;
  }

  console.log("🔄 Creating new room...");

  // 2. Create new room if not found
  const { data: newRoom, error: createError } = await supabase
    .from("chat_rooms")
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
    })
    .select()
    .single();

  if (createError) {
    console.error("❌ Error creating chat room:", createError);
    console.error("   Error code:", createError.code);
    console.error("   Error message:", createError.message);
    console.error("   Error details:", createError.details);
    console.error("   Error hint:", createError.hint);
    console.error("   Full error:", JSON.stringify(createError, null, 2));

    // Check if it's an RLS policy error
    if (
      createError.code === "42501" ||
      createError.message?.includes("policy")
    ) {
      console.error(
        "🔐 RLS Policy Error - User may not have permission to create chat rooms",
      );
      console.error("   Current user:", user.id);
      console.error("   Target user:", targetUserId);
    }

    // Check if it's a foreign key constraint
    if (
      createError.code === "23503" ||
      createError.message?.includes("foreign key")
    ) {
      console.error(
        "🔗 Foreign Key Error - One of the users doesn't exist in users table",
      );
      console.error("   User 1:", user1Id);
      console.error("   User 2:", user2Id);
    }

    return null;
  }

  console.log("✅ New room created:", newRoom.id);
  return newRoom;
}

// Fetch messages for a room
export async function getMessages(roomId: string): Promise<Message[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

// Send a message
export async function sendMessage(
  roomId: string,
  message: string,
  userId: string,
) {
  console.log("📤 Sending message...");
  console.log("  Room:", roomId);
  console.log("  User:", userId);
  console.log("  Text:", message.substring(0, 50));

  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.error("❌ Supabase not available");
    return null;
  }

  // 1. Insert message
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      room_id: roomId,
      sender_id: userId,
      message: message,
      message_type: "text",
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }

  console.log("✅ Message sent successfully:", data.id);

  // 2. Update room's last message
  await supabase
    .from("chat_rooms")
    .update({
      last_message: message,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", roomId);

  console.log("✅ Room last_message updated");

  return data;
}

// Subscribe to new messages in a room
export async function subscribeToChat(
  roomId: string,
  callback: (payload: any) => void,
) {
  console.log("🔔 Setting up realtime subscription for room:", roomId);

  const supabase = await getSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log("📨 New message received via realtime:", payload.new);
        callback(payload.new);
      },
    )
    .subscribe((status) => {
      console.log("🔔 Subscription status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// Get all chat rooms for current user
export async function getUserChatRooms(): Promise<ChatRoom[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch rooms where user is either user1 or user2
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(
      `
      *,
      user1:user1_id(id, first_name, last_name, email),
      user2:user2_id(id, first_name, last_name, email)
    `,
    )
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat rooms:", error);
    return [];
  }

  // Format data to provide "other_user" easily
  return data.map((room: any) => {
    const isUser1 = room.user1_id === user.id;
    return {
      ...room,
      other_user: isUser1 ? room.user2 : room.user1,
    };
  });
}

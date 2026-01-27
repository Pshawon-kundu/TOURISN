/**
 * SUPABASE EDGE FUNCTION: Send Push Notification on New Message
 *
 * This function is triggered when a new message is inserted.
 * It sends a push notification to the recipient if they are:
 * - Not currently online
 * - Not currently viewing the conversation
 *
 * Deploy with: supabase functions deploy send-chat-push
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Expo Push Notification API
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  sender_role: string;
  created_at: string;
}

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data: {
    conversationId: string;
    messageId: string;
    senderId: string;
    type: "chat_message";
  };
  sound: "default";
  badge?: number;
  channelId?: string;
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload = await req.json();

    // This is triggered by a database webhook on INSERT to chat_messages
    const message: Message = payload.record;

    if (!message) {
      return new Response(JSON.stringify({ error: "No message in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("📨 New message received:", message.id);

    // Create Supabase client with service role (server-side only!)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get the conversation to find the recipient
    const { data: conversation, error: convError } = await supabase
      .from("chat_rooms")
      .select("user1_id, user2_id")
      .eq("id", message.room_id)
      .single();

    if (convError || !conversation) {
      console.error("❌ Conversation not found:", convError);
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine recipient (the other user in the conversation)
    const recipientId =
      conversation.user1_id === message.sender_id
        ? conversation.user2_id
        : conversation.user1_id;

    console.log("👤 Recipient:", recipientId);

    // 2. Check if recipient is currently online and viewing this conversation
    const { data: presence } = await supabase
      .from("user_presence")
      .select("is_online, current_conversation_id")
      .eq("user_id", recipientId)
      .single();

    // Skip push if user is online and viewing this conversation
    if (
      presence?.is_online &&
      presence?.current_conversation_id === message.room_id
    ) {
      console.log("⏭️ Recipient is viewing conversation, skipping push");
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: "User is viewing conversation",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 3. Get sender info for notification title
    const { data: sender } = await supabase
      .from("users")
      .select("full_name, first_name")
      .eq("id", message.sender_id)
      .single();

    const senderName = sender?.full_name || sender?.first_name || "Someone";

    // 4. Get recipient's push tokens
    const { data: devices, error: deviceError } = await supabase
      .from("user_devices")
      .select("push_token, platform")
      .eq("user_id", recipientId)
      .eq("is_active", true)
      .not("push_token", "is", null);

    if (deviceError || !devices || devices.length === 0) {
      console.log("⚠️ No active devices found for recipient");
      return new Response(
        JSON.stringify({ skipped: true, reason: "No devices" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`📱 Found ${devices.length} device(s) to notify`);

    // 5. Get unread count for badge
    const { count: unreadCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("room_id", message.room_id)
      .neq("sender_id", recipientId)
      .eq("is_read", false);

    // 6. Build push notifications
    const pushMessages: PushPayload[] = devices
      .filter((d) => d.push_token)
      .map((device) => ({
        to: device.push_token,
        title: senderName,
        body: truncateMessage(message.message, 100),
        data: {
          conversationId: message.room_id,
          messageId: message.id,
          senderId: message.sender_id,
          type: "chat_message",
        },
        sound: "default",
        badge: unreadCount || 1,
        channelId: device.platform === "android" ? "chat-messages" : undefined,
      }));

    // 7. Send push notifications via Expo
    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pushMessages),
    });

    const pushResult = await pushResponse.json();
    console.log("✅ Push sent:", pushResult);

    return new Response(
      JSON.stringify({
        success: true,
        devices: devices.length,
        result: pushResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error in send-chat-push:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// Helper function to truncate message for notification body
function truncateMessage(text: string, maxLength: number): string {
  if (!text) return "New message";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

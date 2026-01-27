/**
 * EXPRESS.JS PUSH NOTIFICATION CONTROLLER
 *
 * Alternative to Supabase Edge Functions for sending push notifications.
 * This controller handles:
 * - Sending push notifications via Expo Push Service
 * - Supporting both FCM (Android) and APNs (iOS)
 * - Checking user presence before sending
 *
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (never expose to client!)
 * - EXPO_ACCESS_TOKEN (optional, for increased rate limits)
 */

import { createClient } from "@supabase/supabase-js";
import { Request, Response, Router } from "express";

const router = Router();

// Expo Push API
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Initialize Supabase with service role key (server-side only!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============================================================================
// INTERFACES
// ============================================================================

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data: Record<string, any>;
  sound?: string;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
  ttl?: number;
}

interface SendPushRequest {
  recipientId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  conversationId?: string;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/push/send
 * Send a push notification to a user
 */
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { recipientId, title, body, data, conversationId }: SendPushRequest =
      req.body;

    if (!recipientId || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: recipientId, title, body",
      });
    }

    // 1. Check if user is online and viewing the conversation (optional optimization)
    if (conversationId) {
      const { data: presence } = await supabase
        .from("user_presence")
        .select("is_online, current_conversation_id")
        .eq("user_id", recipientId)
        .single();

      if (
        presence?.is_online &&
        presence?.current_conversation_id === conversationId
      ) {
        console.log("⏭️ Recipient is viewing conversation, skipping push");
        return res.json({
          success: true,
          skipped: true,
          reason: "User is viewing conversation",
        });
      }
    }

    // 2. Get recipient's active push tokens
    const { data: devices, error: deviceError } = await supabase
      .from("user_devices")
      .select("id, push_token, platform, push_provider")
      .eq("user_id", recipientId)
      .eq("is_active", true)
      .not("push_token", "is", null);

    if (deviceError) {
      console.error("❌ Error fetching devices:", deviceError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch devices" });
    }

    if (!devices || devices.length === 0) {
      console.log("⚠️ No active devices found for recipient:", recipientId);
      return res.json({
        success: true,
        skipped: true,
        reason: "No active devices",
      });
    }

    console.log(
      `📱 Sending push to ${devices.length} device(s) for user ${recipientId}`,
    );

    // 3. Build push payloads
    const pushMessages: PushPayload[] = devices.map((device) => ({
      to: device.push_token,
      title,
      body,
      data: {
        ...data,
        conversationId,
        type: "chat_message",
      },
      sound: "default",
      badge: 1,
      channelId: device.platform === "android" ? "chat-messages" : undefined,
      priority: "high",
      ttl: 3600, // 1 hour TTL
    }));

    // 4. Send to Expo Push Service
    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
        ...(process.env.EXPO_ACCESS_TOKEN && {
          Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
        }),
      },
      body: JSON.stringify(pushMessages),
    });

    const pushResult = await pushResponse.json();

    // 5. Handle push receipts (check for errors)
    if (pushResult.data) {
      const failedTokens: string[] = [];

      pushResult.data.forEach((result: any, index: number) => {
        if (result.status === "error") {
          console.error(`❌ Push failed for device ${index}:`, result.message);

          // Deactivate invalid tokens
          if (result.details?.error === "DeviceNotRegistered") {
            failedTokens.push(devices[index].push_token);
          }
        }
      });

      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await supabase
          .from("user_devices")
          .update({ is_active: false })
          .in("push_token", failedTokens);

        console.log(`🗑️ Deactivated ${failedTokens.length} invalid token(s)`);
      }
    }

    console.log("✅ Push notification sent successfully");

    return res.json({
      success: true,
      devices: devices.length,
      result: pushResult,
    });
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/push/chat-message
 * Specialized endpoint for chat message push notifications
 * Called internally after a message is inserted
 */
router.post("/chat-message", async (req: Request, res: Response) => {
  try {
    const { messageId, conversationId, senderId, message } = req.body;

    if (!messageId || !conversationId || !senderId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // 1. Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from("chat_rooms")
      .select("user1_id, user2_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    }

    // Determine recipient
    const recipientId =
      conversation.user1_id === senderId
        ? conversation.user2_id
        : conversation.user1_id;

    // 2. Get sender info
    const { data: sender } = await supabase
      .from("users")
      .select("full_name, first_name")
      .eq("id", senderId)
      .single();

    const senderName = sender?.full_name || sender?.first_name || "Someone";

    // 3. Get unread count for badge
    const { count: unreadCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("room_id", conversationId)
      .neq("sender_id", recipientId)
      .eq("is_read", false);

    // 4. Check presence
    const { data: presence } = await supabase
      .from("user_presence")
      .select("is_online, current_conversation_id")
      .eq("user_id", recipientId)
      .single();

    if (
      presence?.is_online &&
      presence?.current_conversation_id === conversationId
    ) {
      return res.json({
        success: true,
        skipped: true,
        reason: "User is viewing conversation",
      });
    }

    // 5. Get devices
    const { data: devices } = await supabase
      .from("user_devices")
      .select("push_token, platform")
      .eq("user_id", recipientId)
      .eq("is_active", true)
      .not("push_token", "is", null);

    if (!devices || devices.length === 0) {
      return res.json({
        success: true,
        skipped: true,
        reason: "No devices",
      });
    }

    // 6. Build and send push
    const pushMessages = devices.map((device) => ({
      to: device.push_token,
      title: senderName,
      body: truncateMessage(message, 100),
      data: {
        conversationId,
        messageId,
        senderId,
        type: "chat_message",
      },
      sound: "default",
      badge: unreadCount || 1,
      channelId: device.platform === "android" ? "chat-messages" : undefined,
    }));

    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pushMessages),
    });

    const pushResult = await pushResponse.json();

    return res.json({
      success: true,
      devices: devices.length,
      result: pushResult,
    });
  } catch (error) {
    console.error("❌ Error in chat-message push:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/push/register
 * Register a device for push notifications
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { userId, deviceId, platform, pushToken, appVersion } = req.body;

    if (!userId || !deviceId || !platform || !pushToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const { error } = await supabase.from("user_devices").upsert(
      {
        user_id: userId,
        device_id: deviceId,
        platform,
        push_token: pushToken,
        push_provider: "expo",
        app_version: appVersion,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,device_id",
      },
    );

    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Error registering device:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/push/unregister
 * Unregister a device (on logout)
 */
router.delete("/unregister", async (req: Request, res: Response) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const { error } = await supabase
      .from("user_devices")
      .update({ is_active: false, push_token: null })
      .eq("user_id", userId)
      .eq("device_id", deviceId);

    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Error unregistering device:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Helper function
function truncateMessage(text: string, maxLength: number): string {
  if (!text) return "New message";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export default router;

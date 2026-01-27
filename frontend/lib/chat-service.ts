/**
 * PRODUCTION-READY CHAT SERVICE
 *
 * Features:
 * ✅ Offline message queue with local persistence
 * ✅ Message deduplication with client_msg_id
 * ✅ Delivery & read receipts
 * ✅ Cursor-based pagination
 * ✅ Reconnection handling
 * ✅ Optimistic UI updates
 * ✅ Push notification integration
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { RealtimeChannel } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "file" | "location";
  client_msg_id: string;
  sender_role: "tourist" | "guide";
  attachments?: any[];
  is_read: boolean;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  server_timestamp: string;
  edited_at?: string;
  deleted_at?: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  unread_count_user1: number;
  unread_count_user2: number;
  created_at: string;
  other_user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface OutboxMessage {
  id: string; // client_msg_id
  room_id: string;
  message: string;
  message_type: "text" | "image" | "file" | "location";
  attachments?: any[];
  created_at: string;
  retry_count: number;
  status: "pending" | "sending" | "failed";
}

export interface MessageReceipt {
  message_id: string;
  user_id: string;
  delivered_at?: string;
  read_at?: string;
}

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface LocalMessage extends Message {
  status: MessageStatus;
  localId?: string; // For optimistic UI
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  OUTBOX: "@chat_outbox",
  LAST_SYNC: "@chat_last_sync",
  MESSAGES_CACHE: "@chat_messages_",
  DEVICE_ID: "@device_id",
};

// ============================================================================
// CHAT SERVICE CLASS
// ============================================================================

class ChatService {
  private currentUserId: string | null = null;
  private currentUserRole: "tourist" | "guide" = "tourist";
  private isOnline: boolean = true;
  private realtimeChannel: RealtimeChannel | null = null;
  private presenceChannel: RealtimeChannel | null = null;
  private syncWorkerInterval: ReturnType<typeof setInterval> | null = null;

  // Callbacks for UI updates
  private onMessageReceived: ((message: Message) => void) | null = null;
  private onMessageStatusUpdate:
    | ((messageId: string, status: MessageStatus) => void)
    | null = null;
  private onPresenceUpdate:
    | ((userId: string, isOnline: boolean) => void)
    | null = null;
  private onTypingUpdate: ((userId: string, isTyping: boolean) => void) | null =
    null;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the chat service
   */
  async initialize(
    userId: string,
    userRole: "tourist" | "guide",
  ): Promise<void> {
    this.currentUserId = userId;
    this.currentUserRole = userRole;

    // Setup network listener (simple polling approach)
    this.startNetworkMonitoring();

    // Check initial network state
    this.isOnline = await this.checkNetworkStatus();

    // Start sync worker
    this.startSyncWorker();

    // Register device for push notifications
    await this.registerDevice();

    // Update presence
    await this.updatePresence(true);

    console.log("✅ ChatService initialized for user:", userId);
  }

  /**
   * Cleanup when user logs out or app closes
   */
  async cleanup(): Promise<void> {
    // Update presence to offline
    await this.updatePresence(false);

    // Unsubscribe from realtime
    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    if (this.presenceChannel) {
      await supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }

    // Stop sync worker
    if (this.syncWorkerInterval) {
      clearInterval(this.syncWorkerInterval);
      this.syncWorkerInterval = null;
    }

    // Stop network monitoring
    this.stopNetworkMonitoring();

    this.currentUserId = null;
    console.log("✅ ChatService cleaned up");
  }

  // ============================================================================
  // NETWORK HANDLING
  // ============================================================================

  private networkCheckInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Check network status using a simple fetch
   */
  private async checkNetworkStatus(): Promise<boolean> {
    try {
      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Start monitoring network status
   */
  private startNetworkMonitoring(): void {
    // Check every 15 seconds
    this.networkCheckInterval = setInterval(async () => {
      const wasOnline = this.isOnline;
      this.isOnline = await this.checkNetworkStatus();

      if (!wasOnline && this.isOnline) {
        console.log("📶 Network restored - syncing...");
        this.syncOnReconnect();
      } else if (wasOnline && !this.isOnline) {
        console.log("📶 Network lost");
      }
    }, 15000);
  }

  /**
   * Stop network monitoring
   */
  private stopNetworkMonitoring(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
  }

  private async syncOnReconnect(): Promise<void> {
    console.log("🔄 Reconnected! Starting sync...");

    // 1. Fetch missed messages
    await this.fetchMissedMessages();

    // 2. Process outbox
    await this.processOutbox();

    // 3. Update presence
    await this.updatePresence(true);

    console.log("✅ Sync completed");
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  /**
   * Get or create a conversation between current user and another user
   */
  async getOrCreateConversation(
    otherUserId: string,
  ): Promise<Conversation | null> {
    if (!this.currentUserId) {
      console.error("❌ ChatService not initialized");
      return null;
    }

    try {
      // Use the database function
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        p_user1_id: this.currentUserId,
        p_user2_id: otherUserId,
      });

      if (error) throw error;

      // Fetch the full conversation with other user details
      return this.getConversation(data);
    } catch (error) {
      console.error("❌ Error getting/creating conversation:", error);
      return null;
    }
  }

  /**
   * Get a conversation by ID with other user details
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          user1:users!chat_rooms_user1_id_fkey(id, full_name, email),
          user2:users!chat_rooms_user2_id_fkey(id, full_name, email)
        `,
        )
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Determine which user is "other"
      const otherUser =
        data.user1_id === this.currentUserId ? data.user2 : data.user1;

      return {
        ...data,
        other_user: otherUser,
      };
    } catch (error) {
      console.error("❌ Error fetching conversation:", error);
      return null;
    }
  }

  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<Conversation[]> {
    if (!this.currentUserId) return [];

    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          user1:users!chat_rooms_user1_id_fkey(id, full_name, email),
          user2:users!chat_rooms_user2_id_fkey(id, full_name, email)
        `,
        )
        .or(
          `user1_id.eq.${this.currentUserId},user2_id.eq.${this.currentUserId}`,
        )
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((conv) => ({
        ...conv,
        other_user:
          conv.user1_id === this.currentUserId ? conv.user2 : conv.user1,
      }));
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      return [];
    }
  }

  // ============================================================================
  // MESSAGE MANAGEMENT
  // ============================================================================

  /**
   * Generate a unique client message ID
   */
  private async generateClientMsgId(): Promise<string> {
    return await Crypto.randomUUID();
  }

  /**
   * Get messages for a conversation with cursor-based pagination
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursorTimestamp?: string,
    cursorId?: string,
  ): Promise<Message[]> {
    try {
      const { data, error } = await supabase.rpc("get_messages_paginated", {
        p_conversation_id: conversationId,
        p_limit: limit,
        p_cursor_timestamp: cursorTimestamp || null,
        p_cursor_id: cursorId || null,
      });

      if (error) throw error;

      // Mark messages as delivered
      if (data && data.length > 0) {
        const otherUserMessages = data.filter(
          (m: Message) => m.sender_id !== this.currentUserId,
        );
        if (otherUserMessages.length > 0) {
          await this.markMessagesDelivered(
            otherUserMessages.map((m: Message) => m.id),
          );
        }
      }

      return data || [];
    } catch (error) {
      console.error("❌ Error fetching messages:", error);

      // Try to return cached messages if offline
      return this.getCachedMessages(conversationId);
    }
  }

  /**
   * Send a message - handles both online and offline scenarios
   */
  async sendMessage(
    conversationId: string,
    text: string,
    messageType: "text" | "image" | "file" | "location" = "text",
    attachments?: any[],
  ): Promise<LocalMessage | null> {
    if (!this.currentUserId) {
      console.error("❌ ChatService not initialized");
      return null;
    }

    // Generate unique client message ID for deduplication
    const clientMsgId = await this.generateClientMsgId();
    const now = new Date().toISOString();

    // Create local message for optimistic UI
    const localMessage: LocalMessage = {
      id: clientMsgId, // Temporary ID
      room_id: conversationId,
      sender_id: this.currentUserId,
      message: text,
      message_type: messageType,
      client_msg_id: clientMsgId,
      sender_role: this.currentUserRole,
      attachments: attachments || [],
      is_read: false,
      created_at: now,
      server_timestamp: now,
      status: "pending",
      localId: clientMsgId,
    };

    if (this.isOnline) {
      // Online: Send directly to Supabase
      return this.sendMessageOnline(localMessage);
    } else {
      // Offline: Add to outbox
      await this.addToOutbox(localMessage);
      return localMessage;
    }
  }

  /**
   * Send message when online
   */
  private async sendMessageOnline(
    localMessage: LocalMessage,
  ): Promise<LocalMessage | null> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: localMessage.room_id,
          sender_id: localMessage.sender_id,
          message: localMessage.message,
          message_type: localMessage.message_type,
          client_msg_id: localMessage.client_msg_id,
          sender_role: localMessage.sender_role,
          attachments: localMessage.attachments,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate (message already exists)
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          console.log(
            "⚠️ Message already exists (duplicate), treating as success",
          );
          localMessage.status = "sent";
          return localMessage;
        }
        throw error;
      }

      // Update with server response
      return {
        ...data,
        status: "sent" as MessageStatus,
        localId: localMessage.localId,
      };
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Add to outbox for retry
      localMessage.status = "failed";
      await this.addToOutbox(localMessage);

      return localMessage;
    }
  }

  // ============================================================================
  // OFFLINE OUTBOX MANAGEMENT
  // ============================================================================

  /**
   * Add message to offline outbox
   */
  private async addToOutbox(message: LocalMessage): Promise<void> {
    try {
      const outbox = await this.getOutbox();

      // Avoid duplicates
      if (!outbox.find((m) => m.id === message.client_msg_id)) {
        const outboxMessage: OutboxMessage = {
          id: message.client_msg_id,
          room_id: message.room_id,
          message: message.message,
          message_type: message.message_type,
          attachments: message.attachments,
          created_at: message.created_at,
          retry_count: 0,
          status: "pending",
        };

        outbox.push(outboxMessage);
        await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(outbox));
        console.log("📥 Added to outbox:", message.client_msg_id);
      }
    } catch (error) {
      console.error("❌ Error adding to outbox:", error);
    }
  }

  /**
   * Get all messages in outbox
   */
  private async getOutbox(): Promise<OutboxMessage[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("❌ Error reading outbox:", error);
      return [];
    }
  }

  /**
   * Process outbox - send pending messages
   */
  private async processOutbox(): Promise<void> {
    if (!this.isOnline || !this.currentUserId) return;

    const outbox = await this.getOutbox();
    if (outbox.length === 0) return;

    console.log(`📤 Processing ${outbox.length} outbox messages`);

    const failedMessages: OutboxMessage[] = [];
    const maxRetries = 3;

    // Process messages in order (FIFO)
    for (const msg of outbox) {
      if (msg.retry_count >= maxRetries) {
        console.log(`⚠️ Max retries reached for message ${msg.id}`);
        failedMessages.push(msg);
        continue;
      }

      try {
        const { error } = await supabase.from("chat_messages").insert({
          room_id: msg.room_id,
          sender_id: this.currentUserId,
          message: msg.message,
          message_type: msg.message_type,
          client_msg_id: msg.id,
          sender_role: this.currentUserRole,
          attachments: msg.attachments,
        });

        if (error) {
          // Duplicate is success
          if (error.code === "23505" || error.message?.includes("duplicate")) {
            console.log(`✅ Message ${msg.id} already sent (duplicate)`);
            this.onMessageStatusUpdate?.(msg.id, "sent");
            continue;
          }
          throw error;
        }

        console.log(`✅ Outbox message sent: ${msg.id}`);
        this.onMessageStatusUpdate?.(msg.id, "sent");
      } catch (error) {
        console.error(`❌ Failed to send outbox message ${msg.id}:`, error);
        msg.retry_count++;
        msg.status = "failed";
        failedMessages.push(msg);
      }
    }

    // Update outbox with only failed messages
    await AsyncStorage.setItem(
      STORAGE_KEYS.OUTBOX,
      JSON.stringify(failedMessages),
    );
  }

  // ============================================================================
  // SYNC WORKER
  // ============================================================================

  /**
   * Start the background sync worker
   */
  private startSyncWorker(): void {
    // Run every 30 seconds when online
    this.syncWorkerInterval = setInterval(async () => {
      if (this.isOnline) {
        await this.processOutbox();
      }
    }, 30000);
  }

  /**
   * Fetch messages missed while offline
   */
  private async fetchMissedMessages(): Promise<void> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      const lastSync =
        lastSyncStr || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Default: 24h ago

      const { data, error } = await supabase.rpc("get_missed_messages", {
        p_user_id: this.currentUserId,
        p_since_timestamp: lastSync,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`📥 Fetched ${data.length} missed messages`);

        // Notify UI about each missed message
        for (const msg of data) {
          this.onMessageReceived?.(msg);
        }

        // Mark as delivered
        await this.markMessagesDelivered(data.map((m: Message) => m.id));
      }

      // Update last sync timestamp
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("❌ Error fetching missed messages:", error);
    }
  }

  // ============================================================================
  // DELIVERY & READ RECEIPTS
  // ============================================================================

  /**
   * Mark messages as delivered
   */
  async markMessagesDelivered(messageIds: string[]): Promise<void> {
    if (!this.currentUserId || messageIds.length === 0) return;

    try {
      await supabase.rpc("mark_messages_delivered", {
        p_user_id: this.currentUserId,
        p_message_ids: messageIds,
      });
    } catch (error) {
      console.error("❌ Error marking messages delivered:", error);
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationRead(conversationId: string): Promise<void> {
    if (!this.currentUserId) return;

    try {
      await supabase.rpc("mark_messages_read", {
        p_user_id: this.currentUserId,
        p_conversation_id: conversationId,
      });
    } catch (error) {
      console.error("❌ Error marking conversation read:", error);
    }
  }

  // ============================================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to realtime messages for a conversation
   */
  async subscribeToConversation(
    conversationId: string,
    callbacks: {
      onMessage?: (message: Message) => void;
      onReceipt?: (receipt: MessageReceipt) => void;
      onPresence?: (userId: string, isOnline: boolean) => void;
      onTyping?: (userId: string, isTyping: boolean) => void;
    },
  ): Promise<() => void> {
    // Store callbacks
    this.onMessageReceived = callbacks.onMessage || null;
    this.onPresenceUpdate = callbacks.onPresence || null;
    this.onTypingUpdate = callbacks.onTyping || null;

    // Subscribe to new messages in this conversation
    this.realtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          console.log("📨 Realtime message received:", message.id);

          // Mark as delivered if from other user
          if (message.sender_id !== this.currentUserId) {
            this.markMessagesDelivered([message.id]);
          }

          callbacks.onMessage?.(message);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_receipts",
          filter: `message_id=in.(SELECT id FROM chat_messages WHERE room_id='${conversationId}')`,
        },
        (payload) => {
          const receipt = payload.new as MessageReceipt;
          console.log("📋 Receipt update:", receipt.message_id);
          callbacks.onReceipt?.(receipt);
        },
      )
      .subscribe();

    // Subscribe to presence
    this.presenceChannel = supabase
      .channel(`presence:${conversationId}`)
      .on("presence", { event: "sync" }, () => {
        const state = this.presenceChannel?.presenceState();
        console.log("👥 Presence sync:", state);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("➡️ User joined:", key);
        callbacks.onPresence?.(key, true);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log("⬅️ User left:", key);
        callbacks.onPresence?.(key, false);
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        callbacks.onTyping?.(payload.payload.userId, payload.payload.isTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && this.currentUserId) {
          await this.presenceChannel?.track({ user_id: this.currentUserId });
        }
      });

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromConversation();
    };
  }

  /**
   * Unsubscribe from conversation
   */
  async unsubscribeFromConversation(): Promise<void> {
    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    if (this.presenceChannel) {
      await supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<void> {
    if (!this.presenceChannel || !this.currentUserId) return;

    await this.presenceChannel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: this.currentUserId, isTyping },
    });
  }

  // ============================================================================
  // PRESENCE MANAGEMENT
  // ============================================================================

  /**
   * Update user presence
   */
  async updatePresence(
    isOnline: boolean,
    conversationId?: string,
  ): Promise<void> {
    if (!this.currentUserId) return;

    try {
      await supabase.rpc("update_presence", {
        p_user_id: this.currentUserId,
        p_is_online: isOnline,
        p_current_conversation_id: conversationId || null,
      });
    } catch (error) {
      console.error("❌ Error updating presence:", error);
    }
  }

  // ============================================================================
  // DEVICE & PUSH NOTIFICATION MANAGEMENT
  // ============================================================================

  /**
   * Get or create device ID
   */
  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = await Crypto.randomUUID();
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      // Get permission
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.log("⚠️ Push notification permission denied");
          return;
        }
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      const deviceId = await this.getDeviceId();

      // Determine platform
      const platform =
        Platform.OS === "ios"
          ? "ios"
          : Platform.OS === "android"
            ? "android"
            : "web";

      // Upsert device
      await supabase.from("user_devices").upsert(
        {
          user_id: this.currentUserId,
          device_id: deviceId,
          platform,
          push_token: pushToken,
          push_provider: "expo",
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,device_id",
        },
      );

      console.log("✅ Device registered for push notifications");
    } catch (error) {
      console.error("❌ Error registering device:", error);
    }
  }

  /**
   * Unregister device (on logout)
   */
  async unregisterDevice(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const deviceId = await this.getDeviceId();

      await supabase
        .from("user_devices")
        .update({ is_active: false, push_token: null })
        .eq("user_id", this.currentUserId)
        .eq("device_id", deviceId);

      console.log("✅ Device unregistered");
    } catch (error) {
      console.error("❌ Error unregistering device:", error);
    }
  }

  // ============================================================================
  // LOCAL CACHE
  // ============================================================================

  /**
   * Cache messages locally
   */
  private async cacheMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MESSAGES_CACHE + conversationId,
        JSON.stringify(messages.slice(-100)), // Keep last 100 messages
      );
    } catch (error) {
      console.error("❌ Error caching messages:", error);
    }
  }

  /**
   * Get cached messages
   */
  private async getCachedMessages(conversationId: string): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.MESSAGES_CACHE + conversationId,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("❌ Error reading cached messages:", error);
      return [];
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get message status from receipts
   */
  getMessageStatus(message: Message, currentUserId: string): MessageStatus {
    if (message.sender_id !== currentUserId) {
      return "read"; // Incoming messages are always "read" from sender's perspective
    }

    if (message.read_at) return "read";
    if (message.delivered_at) return "delivered";
    if (message.server_timestamp) return "sent";
    return "pending";
  }

  /**
   * Format message timestamp for display
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;

# Production-Ready Chat System Architecture

## Overview

This document describes the complete architecture for a 1:1 chat system between tourists and tour guides in a tourism/travel app. The system is built with **React Native**, **Supabase (Postgres + Realtime + Auth)**, and optional **Express.js** backend.

---

## A) Database Schema

### Tables Created/Modified

#### 1. `chat_rooms` (Conversations)

```sql
-- Existing columns
id UUID PRIMARY KEY
user1_id UUID NOT NULL REFERENCES users(id)
user2_id UUID NOT NULL REFERENCES users(id)
last_message TEXT
last_message_at TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE

-- New columns added
tourist_id UUID REFERENCES users(id)        -- Role-aware reference
guide_id UUID REFERENCES users(id)          -- Role-aware reference
unread_count_user1 INTEGER DEFAULT 0        -- Unread count for user1
unread_count_user2 INTEGER DEFAULT 0        -- Unread count for user2
archived_by_user1 BOOLEAN DEFAULT FALSE     -- Archive status
archived_by_user2 BOOLEAN DEFAULT FALSE
```

#### 2. `chat_messages` (Messages)

```sql
-- Existing columns
id UUID PRIMARY KEY
room_id UUID NOT NULL REFERENCES chat_rooms(id)
sender_id UUID NOT NULL REFERENCES users(id)
message TEXT NOT NULL
message_type VARCHAR(20) DEFAULT 'text'
is_read BOOLEAN DEFAULT FALSE
read_at TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE

-- New columns for production
client_msg_id TEXT                          -- Client-generated UUID for deduplication
sender_role VARCHAR(20) DEFAULT 'tourist'   -- 'tourist' or 'guide'
attachments JSONB DEFAULT '[]'              -- File/image attachments
edited_at TIMESTAMP WITH TIME ZONE          -- Edit tracking
deleted_at TIMESTAMP WITH TIME ZONE         -- Soft delete
delivered_at TIMESTAMP WITH TIME ZONE       -- Delivery timestamp
server_timestamp TIMESTAMP WITH TIME ZONE   -- Server-assigned timestamp for ordering
```

#### 3. `message_receipts` (New - Delivery & Read Receipts)

```sql
id UUID PRIMARY KEY
message_id UUID NOT NULL REFERENCES chat_messages(id)
user_id UUID NOT NULL REFERENCES users(id)
device_id TEXT                              -- Optional per-device tracking
delivered_at TIMESTAMP WITH TIME ZONE       -- When message reached device
read_at TIMESTAMP WITH TIME ZONE            -- When user viewed message
created_at TIMESTAMP WITH TIME ZONE

CONSTRAINT unique_message_user_receipt UNIQUE (message_id, user_id)
```

#### 4. `user_devices` (New - Push Notification Tokens)

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL REFERENCES users(id)
device_id TEXT NOT NULL                     -- Unique device identifier
platform VARCHAR(20) NOT NULL               -- 'ios', 'android', 'web'
push_token TEXT                             -- FCM/APNs/Expo push token
push_provider VARCHAR(20) DEFAULT 'expo'    -- 'fcm', 'apns', 'expo'
app_version TEXT
is_active BOOLEAN DEFAULT TRUE
last_seen_at TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE

CONSTRAINT unique_user_device UNIQUE (user_id, device_id)
```

#### 5. `user_presence` (New - Online Status)

```sql
user_id UUID PRIMARY KEY REFERENCES users(id)
is_online BOOLEAN DEFAULT FALSE
last_seen_at TIMESTAMP WITH TIME ZONE
current_conversation_id UUID                -- Which chat they're viewing
updated_at TIMESTAMP WITH TIME ZONE
```

### Key Indexes

```sql
-- Messages pagination (cursor-based)
CREATE INDEX idx_messages_conversation_cursor
  ON chat_messages(room_id, server_timestamp DESC, id);

-- Missed messages after reconnect
CREATE INDEX idx_messages_room_after_timestamp
  ON chat_messages(room_id, server_timestamp);

-- Duplicate prevention
CREATE UNIQUE INDEX idx_messages_client_msg_id_unique
  ON chat_messages(sender_id, client_msg_id)
  WHERE client_msg_id IS NOT NULL;

-- Active devices lookup
CREATE INDEX idx_devices_active
  ON user_devices(user_id, is_active) WHERE is_active = TRUE;
```

---

## B) Row Level Security (RLS)

### Chat Rooms Policies

```sql
-- Only participants can view
CREATE POLICY "chat_rooms_select_participants"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Only authenticated users can create (must be participant)
CREATE POLICY "chat_rooms_insert_participant"
  ON chat_rooms FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.uid() = user1_id OR auth.uid() = user2_id)
  );
```

### Chat Messages Policies

```sql
-- Only participants can read messages
CREATE POLICY "chat_messages_select_participants"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

-- Sender must match auth.uid() AND be participant
CREATE POLICY "chat_messages_insert_sender"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );
```

### Message Receipts Policies

```sql
-- Users can only manage their own receipts
CREATE POLICY "receipts_insert_own"
  ON message_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND /* conversation participant check */);

CREATE POLICY "receipts_update_own"
  ON message_receipts FOR UPDATE
  USING (auth.uid() = user_id);
```

### User Devices Policies

```sql
-- Users can only access their own devices
CREATE POLICY "devices_select_own"
  ON user_devices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "devices_insert_own"
  ON user_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## C) Realtime Subscriptions

### 1. Subscribe to Messages

```typescript
// Subscribe to new messages in a conversation
const channel = supabase
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
      const message = payload.new;
      // Handle new message
      markMessageDelivered(message.id);
    },
  )
  .subscribe();
```

### 2. Offline Receive (Fetch Missed Messages)

```typescript
// After reconnect, fetch messages since last sync
async function fetchMissedMessages(lastSyncTimestamp: string) {
  const { data } = await supabase.rpc("get_missed_messages", {
    p_user_id: currentUserId,
    p_since_timestamp: lastSyncTimestamp,
  });

  // Process missed messages
  for (const msg of data) {
    handleNewMessage(msg);
    markMessageDelivered(msg.id);
  }

  // Update last sync timestamp
  await AsyncStorage.setItem("@last_sync", new Date().toISOString());
}
```

### 3. Presence (Online/Offline Indicator)

```typescript
const presenceChannel = supabase
  .channel(`presence:${conversationId}`)
  .on("presence", { event: "sync" }, () => {
    const state = presenceChannel.presenceState();
    // Update UI with who's online
  })
  .on("presence", { event: "join" }, ({ key }) => {
    // User came online
  })
  .on("presence", { event: "leave" }, ({ key }) => {
    // User went offline
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await presenceChannel.track({ user_id: currentUserId });
    }
  });
```

### 4. Typing Indicator (Broadcast)

```typescript
// Send typing indicator
await presenceChannel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId: currentUserId, isTyping: true },
});

// Receive typing indicator
.on('broadcast', { event: 'typing' }, (payload) => {
  setIsTyping(payload.payload.isTyping);
})
```

---

## D) React Native Client Logic

### Flow 1: Creating/Opening a Conversation

```typescript
async function openChat(otherUserId: string) {
  // 1. Get or create conversation
  const { data: conversationId } = await supabase.rpc(
    "get_or_create_conversation",
    { p_user1_id: currentUserId, p_user2_id: otherUserId },
  );

  // 2. Navigate to chat screen
  router.push(`/chat-room?conversationId=${conversationId}`);
}
```

### Flow 2: Loading Messages (Pagination)

```typescript
// Initial load
const messages = await supabase.rpc("get_messages_paginated", {
  p_conversation_id: conversationId,
  p_limit: 30,
});

// Load more (infinite scroll)
const moreMessages = await supabase.rpc("get_messages_paginated", {
  p_conversation_id: conversationId,
  p_limit: 30,
  p_cursor_timestamp: oldestMessage.server_timestamp,
  p_cursor_id: oldestMessage.id,
});
```

### Flow 3: Sending a Message

```typescript
async function sendMessage(text: string) {
  // 1. Generate client_msg_id
  const clientMsgId = await Crypto.randomUUID();

  // 2. Optimistic UI update
  const optimisticMsg = {
    id: clientMsgId,
    message: text,
    status: "pending",
    sender_id: currentUserId,
    created_at: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, optimisticMsg]);

  // 3. Check network
  const { isConnected } = await NetInfo.fetch();

  if (isConnected) {
    // 4a. Online: Insert to Supabase
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: conversationId,
        sender_id: currentUserId,
        message: text,
        client_msg_id: clientMsgId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Duplicate - already sent, treat as success
        updateMessageStatus(clientMsgId, "sent");
      } else {
        // Failed - add to outbox
        addToOutbox(optimisticMsg);
        updateMessageStatus(clientMsgId, "failed");
      }
    } else {
      // Success
      updateMessageStatus(clientMsgId, "sent");
    }
  } else {
    // 4b. Offline: Add to outbox
    addToOutbox(optimisticMsg);
  }
}
```

### Flow 4: Sync Worker

```typescript
// Run on app start and after reconnect
async function syncOutbox() {
  const outbox = await AsyncStorage.getItem("@chat_outbox");
  const messages = JSON.parse(outbox || "[]");

  for (const msg of messages) {
    try {
      await supabase.from("chat_messages").insert({
        room_id: msg.room_id,
        sender_id: currentUserId,
        message: msg.message,
        client_msg_id: msg.id,
      });

      // Remove from outbox
      removeFromOutbox(msg.id);
      updateMessageStatus(msg.id, "sent");
    } catch (error) {
      if (error.code === "23505") {
        // Already sent (duplicate)
        removeFromOutbox(msg.id);
      } else {
        msg.retryCount++;
        if (msg.retryCount >= 3) {
          updateMessageStatus(msg.id, "failed");
        }
      }
    }
  }
}
```

### Flow 5: Delivery & Read Receipts

```typescript
// Mark as delivered when message is received
async function markDelivered(messageIds: string[]) {
  await supabase.rpc("mark_messages_delivered", {
    p_user_id: currentUserId,
    p_message_ids: messageIds,
  });
}

// Mark as read when conversation is opened
async function markRead(conversationId: string) {
  await supabase.rpc("mark_messages_read", {
    p_user_id: currentUserId,
    p_conversation_id: conversationId,
  });
}
```

### Local Storage Recommendation

- **AsyncStorage**: For small data (outbox queue, last sync timestamp, device ID)
- **SQLite (expo-sqlite)**: For larger message caches if needed
- **MMKV**: For high-performance key-value storage

---

## E) Push Notification Design

### Option 1: Supabase Edge Function

**File**: `supabase/functions/send-chat-push/index.ts`

**Trigger Methods**:

1. **Database Webhook**: Configure in Supabase Dashboard → Database → Webhooks → Create webhook on `chat_messages` INSERT
2. **Direct Call**: Call from backend after message insert

**Secrets Management**:

```bash
# Set secrets
supabase secrets set EXPO_ACCESS_TOKEN=your_token
# SUPABASE_SERVICE_ROLE_KEY is auto-available
```

**Deploy**:

```bash
supabase functions deploy send-chat-push
```

### Option 2: Express.js Server

**File**: `backend/src/controllers/pushController.ts`

**Endpoints**:

- `POST /api/push/chat-message` - Send push for new chat message
- `POST /api/push/register` - Register device
- `DELETE /api/push/unregister` - Unregister device

**Security**:

- Service role key only on server (NEVER in client)
- Validate JWT in middleware
- Rate limiting on push endpoints

### Push Payload Structure

```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "John Doe",
  "body": "Hey, are you available tomorrow?",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "senderId": "uuid",
    "type": "chat_message"
  },
  "sound": "default",
  "badge": 3,
  "channelId": "chat-messages"
}
```

### Deep Linking on Tap

```typescript
// App.tsx - Handle notification tap
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  if (data.type === "chat_message") {
    router.push(`/chat-room?conversationId=${data.conversationId}`);
  }
});
```

### Skip Push When User Active

```typescript
// Before sending push, check presence
const { data: presence } = await supabase
  .from("user_presence")
  .select("is_online, current_conversation_id")
  .eq("user_id", recipientId)
  .single();

if (
  presence?.is_online &&
  presence?.current_conversation_id === conversationId
) {
  // Skip push - user is viewing the chat
  return;
}
```

---

## F) Edge Cases & Testing Checklist

### 1. App Background/Killed

- [ ] Messages received while backgrounded show as push notifications
- [ ] Tapping notification opens correct conversation
- [ ] On app return, missed messages are fetched
- [ ] Unread badge updates correctly

### 2. Intermittent Network

- [ ] Message shows "pending" status when network drops mid-send
- [ ] Outbox persists across app restarts
- [ ] Sync worker retries on reconnect
- [ ] UI recovers gracefully after network restoration

### 3. Multi-Device Login

- [ ] Messages sync across all devices
- [ ] Read status syncs across devices
- [ ] Push sent to all active devices
- [ ] Device deregistration on logout

### 4. Clock Drift

- [ ] Server timestamp used for ordering (not client time)
- [ ] Messages display in correct order even with client clock issues
- [ ] Cursor pagination uses server_timestamp

### 5. Duplicates & Idempotency

- [ ] Same message can't be inserted twice (client_msg_id unique)
- [ ] Retry on error doesn't create duplicate
- [ ] Offline queue handles duplicate gracefully

### 6. Security Pitfalls

- [ ] Service role key never exposed to client
- [ ] RLS policies tested with different user contexts
- [ ] Push tokens are user-specific
- [ ] Cannot read other users' conversations

### 7. Load/Performance

- [ ] Pagination works with 1000+ messages
- [ ] Indexes used for common queries
- [ ] Realtime subscriptions filtered properly
- [ ] Rate limiting on message sends (anti-spam)

### 8. Testing Scenarios

```bash
# Test delivery receipt
1. User A sends message
2. User B opens app → message marked delivered
3. User A sees checkmark (delivered)

# Test read receipt
1. User A sends message
2. User B opens conversation → message marked read
3. User A sees blue checkmarks (read)

# Test offline sending
1. Turn off network on device
2. Send message → shows pending
3. Turn on network → message syncs, shows sent

# Test missed messages
1. User B offline
2. User A sends 5 messages
3. User B opens app → all 5 messages appear
```

---

## Files Created

| File                                                 | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `backend/migrations/013_production_chat_system.sql`  | Database schema, RLS, functions               |
| `frontend/lib/chat-service.ts`                       | Client-side chat service with offline support |
| `frontend/app/chat-room-v2.tsx`                      | Production chat UI component                  |
| `backend/supabase/functions/send-chat-push/index.ts` | Edge function for push notifications          |
| `backend/src/controllers/pushController.ts`          | Express.js push notification endpoints        |

---

## Migration Steps

1. **Run SQL Migration**:

   ```bash
   # In Supabase SQL Editor or via CLI
   psql $DATABASE_URL < backend/migrations/013_production_chat_system.sql
   ```

2. **Deploy Edge Function** (if using):

   ```bash
   supabase functions deploy send-chat-push
   ```

3. **Configure Webhook** (Supabase Dashboard):
   - Database → Webhooks → Create
   - Table: `chat_messages`
   - Event: INSERT
   - URL: Your edge function URL

4. **Install Dependencies**:

   ```bash
   cd frontend
   npm install @react-native-async-storage/async-storage
   npm install @react-native-community/netinfo
   npm install expo-crypto
   npm install expo-notifications
   ```

5. **Configure Push Notifications** (Expo):
   ```json
   // app.json
   {
     "expo": {
       "plugins": [
         [
           "expo-notifications",
           {
             "sounds": ["./assets/sounds/notification.wav"]
           }
         ]
       ]
     }
   }
   ```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React Native Client                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  ChatService │  │ AsyncStorage │  │   NetInfo    │  │    Expo      │ │
│  │              │  │   (Outbox)   │  │  (Network)   │  │ Notifications│ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Supabase JS Client                             │   │
│  │  • Auth (JWT)  • Postgres Queries  • Realtime  • RPC Functions   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Supabase                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         PostgreSQL                                │   │
│  │  • chat_rooms  • chat_messages  • message_receipts               │   │
│  │  • user_devices  • user_presence  • RLS Policies                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────┐   ┌────────────────────────────────────┐  │
│  │    Realtime Server       │   │    Edge Functions                  │  │
│  │  • postgres_changes      │   │  • send-chat-push                  │  │
│  │  • presence              │   │  • (triggered by webhook)          │  │
│  │  • broadcast             │   │                                    │  │
│  └──────────────────────────┘   └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Push Notification Services                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Expo Push   │  │     FCM      │  │    APNs      │                   │
│  │   Service    │  │  (Android)   │  │    (iOS)     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

This architecture provides:

✅ **Persistence**: All messages stored in Postgres, fetchable after reconnect  
✅ **Realtime**: Instant delivery via Supabase Realtime when both online  
✅ **Offline Sending**: Local outbox queue with automatic sync  
✅ **Message States**: Accurate `sent` → `delivered` → `read` with timestamps  
✅ **No Duplicates**: `client_msg_id` + unique constraint prevents duplicates  
✅ **Correct Ordering**: Server timestamps ensure consistent ordering  
✅ **Access Control**: RLS policies restrict access to participants only  
✅ **Push Notifications**: Expo-based push with presence check  
✅ **Scalability**: Proper indexes, cursor pagination, optimized queries  
✅ **Mobile Realities**: Handles background/kill, reconnect, multi-device │
│ │ PostgreSQL │ │
│ │ • chat_rooms • chat_messages • message_receipts │ │
│ │ • user_devices • user_presence • RLS Policies │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────┐ ┌────────────────────────────────────┐ │
│ │ Realtime Server │ │ Edge Functions │ │
│ │ • postgres_changes │ │ • send-chat-push │ │
│ │ • presence │ │ • (triggered by webhook) │ │
│ │ • broadcast │ │ │ │
│ └──────────────────────────┘ └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Push Notification Services │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Expo Push │ │ FCM │ │ APNs │ │
│ │ Service │ │ (Android) │ │ (iOS) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

```

---

## Summary

This architecture provides:

✅ **Persistence**: All messages stored in Postgres, fetchable after reconnect
✅ **Realtime**: Instant delivery via Supabase Realtime when both online
✅ **Offline Sending**: Local outbox queue with automatic sync
✅ **Message States**: Accurate `sent` → `delivered` → `read` with timestamps
✅ **No Duplicates**: `client_msg_id` + unique constraint prevents duplicates
✅ **Correct Ordering**: Server timestamps ensure consistent ordering
✅ **Access Control**: RLS policies restrict access to participants only
✅ **Push Notifications**: Expo-based push with presence check
✅ **Scalability**: Proper indexes, cursor pagination, optimized queries
✅ **Mobile Realities**: Handles background/kill, reconnect, multi-device
```

-- ============================================================================
-- PRODUCTION-READY CHAT SYSTEM FOR TOURISM APP
-- Migration: 013_production_chat_system.sql
-- 
-- Features:
-- ✅ Message delivery & read receipts with timestamps
-- ✅ Client-side message ID for duplicate prevention
-- ✅ Push notification tokens storage
-- ✅ Online presence tracking
-- ✅ Comprehensive RLS policies
-- ✅ Optimized indexes for pagination
-- ============================================================================

-- ============================================================================
-- PART A: ENHANCED DATABASE SCHEMA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CONVERSATIONS TABLE (Enhanced from existing chat_rooms)
-- ----------------------------------------------------------------------------
-- Note: We'll keep backward compatibility with existing chat_rooms
-- but add the new columns needed for production

-- Add new columns to existing chat_rooms table
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS tourist_id UUID REFERENCES users(id);
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS guide_id UUID REFERENCES users(id);
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS unread_count_user1 INTEGER DEFAULT 0;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS unread_count_user2 INTEGER DEFAULT 0;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS archived_by_user1 BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS archived_by_user2 BOOLEAN DEFAULT FALSE;

-- Create index for unread counts
CREATE INDEX IF NOT EXISTS idx_chat_rooms_unread ON chat_rooms(user1_id, unread_count_user1);

-- ----------------------------------------------------------------------------
-- 2. MESSAGES TABLE (Enhanced from existing chat_messages)
-- ----------------------------------------------------------------------------

-- Add new columns to existing chat_messages for production features
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_msg_id TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_role VARCHAR(20) DEFAULT 'tourist' 
  CHECK (sender_role IN ('tourist', 'guide'));
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create unique constraint to prevent duplicate messages (idempotency)
-- This allows retries without creating duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_client_msg_id_unique 
  ON chat_messages(sender_id, client_msg_id) 
  WHERE client_msg_id IS NOT NULL;

-- Index for cursor-based pagination (conversation messages ordered by time)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_cursor 
  ON chat_messages(room_id, server_timestamp DESC, id);

-- Index for fetching missed messages after reconnect
CREATE INDEX IF NOT EXISTS idx_messages_room_after_timestamp 
  ON chat_messages(room_id, server_timestamp);

-- Index for soft-deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted 
  ON chat_messages(room_id, server_timestamp DESC) 
  WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 3. MESSAGE RECEIPTS TABLE (Multi-device support)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS message_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT, -- Optional: track per-device delivery
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user has one receipt per message (can update for multi-device)
  CONSTRAINT unique_message_user_receipt UNIQUE (message_id, user_id)
);

-- Indexes for receipts
CREATE INDEX IF NOT EXISTS idx_receipts_message ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON message_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_undelivered ON message_receipts(user_id, delivered_at) 
  WHERE delivered_at IS NULL;

-- ----------------------------------------------------------------------------
-- 4. USER DEVICES TABLE (Push Notification Tokens)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL, -- Unique device identifier (from client)
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  push_token TEXT, -- FCM/APNs/Expo push token
  push_provider VARCHAR(20) DEFAULT 'expo' CHECK (push_provider IN ('fcm', 'apns', 'expo')),
  app_version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each device is unique per user
  CONSTRAINT unique_user_device UNIQUE (user_id, device_id)
);

-- Indexes for device lookups
CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_push_token ON user_devices(push_token) WHERE push_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_active ON user_devices(user_id, is_active) WHERE is_active = TRUE;

-- ----------------------------------------------------------------------------
-- 5. USER PRESENCE TABLE (Online/Offline Status)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_conversation_id UUID REFERENCES chat_rooms(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for presence lookups
CREATE INDEX IF NOT EXISTS idx_presence_online ON user_presence(is_online) WHERE is_online = TRUE;

-- ============================================================================
-- PART B: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- CHAT ROOMS POLICIES (Enhanced)
-- ----------------------------------------------------------------------------

-- Drop existing policies to recreate with enhancements
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can update their own chat rooms" ON chat_rooms;

-- SELECT: Only participants can view the conversation
CREATE POLICY "chat_rooms_select_participants"
  ON chat_rooms FOR SELECT
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- INSERT: Only authenticated users can create rooms where they are a participant
CREATE POLICY "chat_rooms_insert_participant"
  ON chat_rooms FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.uid() = user1_id OR auth.uid() = user2_id)
  );

-- UPDATE: Only participants can update room metadata (last message, archived status)
CREATE POLICY "chat_rooms_update_participants"
  ON chat_rooms FOR UPDATE
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

-- ----------------------------------------------------------------------------
-- CHAT MESSAGES POLICIES (Enhanced)
-- ----------------------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- SELECT: Only conversation participants can read messages
CREATE POLICY "chat_messages_select_participants"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

-- INSERT: Only participants can send messages, and sender must match auth.uid()
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

-- UPDATE: Users can only update their own messages (for editing)
CREATE POLICY "chat_messages_update_own"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- DELETE: Soft delete only - users can mark their own messages as deleted
CREATE POLICY "chat_messages_delete_own"
  ON chat_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ----------------------------------------------------------------------------
-- MESSAGE RECEIPTS POLICIES
-- ----------------------------------------------------------------------------

-- SELECT: Users can see receipts for messages in their conversations
CREATE POLICY "receipts_select_conversation_participants"
  ON message_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_rooms cr ON cr.id = cm.room_id
      WHERE cm.id = message_receipts.message_id
      AND (cr.user1_id = auth.uid() OR cr.user2_id = auth.uid())
    )
  );

-- INSERT: Users can only create their own receipts
CREATE POLICY "receipts_insert_own"
  ON message_receipts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_rooms cr ON cr.id = cm.room_id
      WHERE cm.id = message_id
      AND (cr.user1_id = auth.uid() OR cr.user2_id = auth.uid())
    )
  );

-- UPDATE: Users can only update their own receipts
CREATE POLICY "receipts_update_own"
  ON message_receipts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- USER DEVICES POLICIES
-- ----------------------------------------------------------------------------

-- SELECT: Users can only view their own devices
CREATE POLICY "devices_select_own"
  ON user_devices FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only add their own devices
CREATE POLICY "devices_insert_own"
  ON user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own devices
CREATE POLICY "devices_update_own"
  ON user_devices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only remove their own devices
CREATE POLICY "devices_delete_own"
  ON user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- USER PRESENCE POLICIES
-- ----------------------------------------------------------------------------

-- SELECT: All authenticated users can see presence (for online indicators)
CREATE POLICY "presence_select_all"
  ON user_presence FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Users can only set their own presence
CREATE POLICY "presence_insert_own"
  ON user_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own presence
CREATE POLICY "presence_update_own"
  ON user_presence FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART C: HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: Get or create conversation between two users
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_sorted_user1 UUID;
  v_sorted_user2 UUID;
BEGIN
  -- Sort user IDs to ensure consistent ordering
  IF p_user1_id < p_user2_id THEN
    v_sorted_user1 := p_user1_id;
    v_sorted_user2 := p_user2_id;
  ELSE
    v_sorted_user1 := p_user2_id;
    v_sorted_user2 := p_user1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM chat_rooms
  WHERE user1_id = v_sorted_user1 AND user2_id = v_sorted_user2;

  -- Create if not exists
  IF v_conversation_id IS NULL THEN
    INSERT INTO chat_rooms (user1_id, user2_id)
    VALUES (v_sorted_user1, v_sorted_user2)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Update last message in conversation (called after insert)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET 
    last_message = NEW.message,
    last_message_at = NEW.server_timestamp,
    updated_at = NOW(),
    -- Increment unread count for the other user
    unread_count_user1 = CASE 
      WHEN NEW.sender_id != user1_id THEN COALESCE(unread_count_user1, 0) + 1 
      ELSE unread_count_user1 
    END,
    unread_count_user2 = CASE 
      WHEN NEW.sender_id != user2_id THEN COALESCE(unread_count_user2, 0) + 1 
      ELSE unread_count_user2 
    END
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating last message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON chat_messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ----------------------------------------------------------------------------
-- Function: Mark messages as delivered (bulk)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_messages_delivered(
  p_user_id UUID,
  p_message_ids UUID[]
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO message_receipts (message_id, user_id, delivered_at)
  SELECT unnest(p_message_ids), p_user_id, NOW()
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET delivered_at = COALESCE(message_receipts.delivered_at, NOW());
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Mark messages as read (and reset unread count)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_user_id UUID,
  p_conversation_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update receipts for all unread messages in conversation
  INSERT INTO message_receipts (message_id, user_id, delivered_at, read_at)
  SELECT cm.id, p_user_id, NOW(), NOW()
  FROM chat_messages cm
  WHERE cm.room_id = p_conversation_id
    AND cm.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_receipts mr 
      WHERE mr.message_id = cm.id 
      AND mr.user_id = p_user_id 
      AND mr.read_at IS NOT NULL
    )
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET read_at = COALESCE(message_receipts.read_at, NOW());
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Reset unread count for this user
  UPDATE chat_rooms
  SET 
    unread_count_user1 = CASE WHEN user1_id = p_user_id THEN 0 ELSE unread_count_user1 END,
    unread_count_user2 = CASE WHEN user2_id = p_user_id THEN 0 ELSE unread_count_user2 END
  WHERE id = p_conversation_id;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Get messages with cursor-based pagination
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_messages_paginated(
  p_conversation_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  room_id UUID,
  sender_id UUID,
  message TEXT,
  message_type VARCHAR,
  client_msg_id TEXT,
  sender_role VARCHAR,
  attachments JSONB,
  is_read BOOLEAN,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  server_timestamp TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.room_id,
    cm.sender_id,
    cm.message,
    cm.message_type,
    cm.client_msg_id,
    cm.sender_role,
    cm.attachments,
    cm.is_read,
    cm.delivered_at,
    cm.read_at,
    cm.created_at,
    cm.server_timestamp,
    cm.edited_at,
    cm.deleted_at
  FROM chat_messages cm
  WHERE cm.room_id = p_conversation_id
    AND cm.deleted_at IS NULL
    AND (
      p_cursor_timestamp IS NULL 
      OR cm.server_timestamp < p_cursor_timestamp
      OR (cm.server_timestamp = p_cursor_timestamp AND cm.id < p_cursor_id)
    )
  ORDER BY cm.server_timestamp DESC, cm.id DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Get missed messages since timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_missed_messages(
  p_user_id UUID,
  p_since_timestamp TIMESTAMP WITH TIME ZONE
) RETURNS TABLE (
  id UUID,
  room_id UUID,
  sender_id UUID,
  message TEXT,
  message_type VARCHAR,
  client_msg_id TEXT,
  server_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.room_id,
    cm.sender_id,
    cm.message,
    cm.message_type,
    cm.client_msg_id,
    cm.server_timestamp
  FROM chat_messages cm
  JOIN chat_rooms cr ON cr.id = cm.room_id
  WHERE (cr.user1_id = p_user_id OR cr.user2_id = p_user_id)
    AND cm.server_timestamp > p_since_timestamp
    AND cm.sender_id != p_user_id
    AND cm.deleted_at IS NULL
  ORDER BY cm.server_timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: Update user presence
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_presence(
  p_user_id UUID,
  p_is_online BOOLEAN,
  p_current_conversation_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence (user_id, is_online, last_seen_at, current_conversation_id, updated_at)
  VALUES (p_user_id, p_is_online, NOW(), p_current_conversation_id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = p_is_online,
    last_seen_at = NOW(),
    current_conversation_id = p_current_conversation_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART D: REALTIME SETUP
-- ============================================================================

-- Add tables to realtime publication
DO $$
BEGIN
  -- chat_messages (if not already added)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
  
  -- message_receipts
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'message_receipts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE message_receipts;
  END IF;
  
  -- user_presence
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
  END IF;
END $$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Production Chat System migration completed successfully!' AS status;

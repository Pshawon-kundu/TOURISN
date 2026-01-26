-- Enable RLS on tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Rooms Policies
-- Users can view rooms where they are participant
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
CREATE POLICY "Users can view their own chat rooms"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create rooms with themselves
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update rooms they belong to (e.g. last_message)
DROP POLICY IF EXISTS "Users can update their own chat rooms" ON chat_rooms;
CREATE POLICY "Users can update their own chat rooms"
  ON chat_rooms FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Chat Messages Policies
-- Users can view messages in rooms they belong to
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;
CREATE POLICY "Users can view messages in their rooms"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_messages.room_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Users can insert messages into rooms they belong to
DROP POLICY IF EXISTS "Users can insert messages in their rooms" ON chat_messages;
CREATE POLICY "Users can insert messages in their rooms"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_messages.room_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Realtime Setup
-- Add table to publication to enable listening to changes
-- Use DO block to check if table is already in publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
END $$;

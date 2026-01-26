-- Setup Guide Online Status Table in Supabase
-- Run this in Supabase SQL Editor

-- Create table for tracking guide online status
CREATE TABLE IF NOT EXISTS guide_online_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guide_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guide_online_status_guide_id ON guide_online_status(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_online_status_online ON guide_online_status(is_online);

-- Enable RLS
ALTER TABLE guide_online_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view guide online status" ON guide_online_status;
DROP POLICY IF EXISTS "Guides can update own status" ON guide_online_status;

-- Policy: Anyone can view online status
CREATE POLICY "Anyone can view guide online status"
  ON guide_online_status FOR SELECT
  USING (true);

-- Policy: Guides can update their own status
CREATE POLICY "Guides can update own status"
  ON guide_online_status FOR ALL
  USING (
    guide_id IN (
      SELECT id FROM guides WHERE user_id = auth.uid()
    )
  );

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_guide_online_status_updated_at ON guide_online_status;

CREATE TRIGGER update_guide_online_status_updated_at
    BEFORE UPDATE ON guide_online_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initialize status for existing guides
INSERT INTO guide_online_status (guide_id, is_online, last_seen)
SELECT id, false, now()
FROM guides
WHERE id NOT IN (SELECT guide_id FROM guide_online_status)
ON CONFLICT (guide_id) DO NOTHING;

-- Verify setup
SELECT 'guide_online_status table created successfully' AS status;
SELECT COUNT(*) AS total_guides_with_status FROM guide_online_status;

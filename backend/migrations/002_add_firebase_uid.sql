-- Add firebase_uid column to users table to store Firebase authentication UID
-- This enables mapping Firebase UIDs (from custom tokens) back to Supabase UUIDs

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Add comment explaining the column
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Admin SDK UID from authentication, used to link Firebase Auth with Supabase user profiles';

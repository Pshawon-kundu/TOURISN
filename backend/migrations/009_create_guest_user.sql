-- Create a default guest user for anonymous bookings
-- This script should be run in Supabase SQL Editor

-- Insert guest user (if users table exists in auth schema)
-- Note: In Supabase, users are typically managed through auth.users
-- For our app, we'll create a record that can be referenced by bookings

-- Check if we can insert into auth.users or if we need a custom users table
-- For now, we'll assume the system uses Supabase's built-in auth system

-- Option 1: If using auth.users, we can't directly insert
-- Option 2: Create a custom users table or modify foreign key constraint

-- Let's modify the bookings table to make user_id nullable for guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment to explain guest users
COMMENT ON COLUMN bookings.user_id IS 'User ID from auth.users, NULL for guest bookings';

-- Create an index for guest bookings
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(user_id) WHERE user_id IS NULL;
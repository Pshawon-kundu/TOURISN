-- Enable RLS and create policies for users table
-- This needs to be run in Supabase SQL Editor

-- Check current users table
SELECT * FROM users;

-- Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous signups (backend using anon key can insert)
CREATE POLICY "Allow anon signups"
ON users
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE  
TO authenticated
USING (auth.uid()::text = id);

-- Allow all authenticated users to read basic user info (for chat, guide listings, etc)
CREATE POLICY "Authenticated users can read all users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access"
ON users
FOR ALL
TO service_role
USING (true);

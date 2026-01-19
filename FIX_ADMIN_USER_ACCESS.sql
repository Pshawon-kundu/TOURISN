-- FIX: Allow Admin Panel to Read Users Table
-- Run this in Supabase SQL Editor

-- Enable RLS on users table first
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon to read users" ON users;
DROP POLICY IF EXISTS "Allow anon to update users" ON users;
DROP POLICY IF EXISTS "Allow anon to insert users" ON users;

-- Create policy to allow reading users
CREATE POLICY "Allow anon to read users"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- Create policy to allow updating users
CREATE POLICY "Allow anon to update users"
ON users FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow inserting users
CREATE POLICY "Allow anon to insert users"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

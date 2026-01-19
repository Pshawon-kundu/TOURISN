-- Migration Script: Add User Status Management
-- Run this in Supabase SQL Editor
-- Date: January 19, 2026

-- Step 1: Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 2: Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Step 3: Add constraint to ensure valid status values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'pending', 'suspended'));

-- Step 4: Update existing users to have 'active' status
-- This ensures existing users don't need re-approval
UPDATE users 
SET status = 'active', 
    updated_at = NOW()
WHERE status IS NULL OR status = '';

-- Step 5: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger to auto-update updated_at on user changes
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify the changes
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_users,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users
FROM users;

-- Expected output: All existing users should be 'active'
-- New signups will default to 'pending'

COMMENT ON COLUMN users.status IS 'User account status: active, pending, or suspended';
COMMENT ON COLUMN users.updated_at IS 'Timestamp of last user record update';
COMMENT ON COLUMN users.phone IS 'User phone number for contact';

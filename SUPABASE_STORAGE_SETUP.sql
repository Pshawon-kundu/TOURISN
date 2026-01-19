-- Create storage bucket for NID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('nid-documents', 'nid-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for NID documents bucket

-- Allow authenticated users to upload their own NID
CREATE POLICY "Users can upload their own NID"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nid-documents' 
  AND (storage.foldername(name))[1] = 'nid-images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to read their own NID
CREATE POLICY "Users can read their own NID"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'nid-documents'
  AND (storage.foldername(name))[1] = 'nid-images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to read all NIDs
CREATE POLICY "Admins can read all NIDs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'nid-documents'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Update users table to include NID fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_number VARCHAR(17);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nid_verification_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add index for faster NID lookups
CREATE INDEX IF NOT EXISTS idx_users_nid_number ON users(nid_number);
CREATE INDEX IF NOT EXISTS idx_users_nid_verified ON users(nid_verified);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Add check constraint for status
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check 
  CHECK (status IN ('active', 'pending', 'suspended'));

-- Update guides table to include NID fields if not exists
ALTER TABLE guides ADD COLUMN IF NOT EXISTS nid_image_url TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS nid_verified BOOLEAN DEFAULT false;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS nid_verification_date TIMESTAMP;

-- Bangladesh NID Verification System
-- Run this script in Supabase SQL Editor

-- 1. Create NID verifications table
CREATE TABLE IF NOT EXISTS nid_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nid_number VARCHAR(17) NOT NULL,
    date_of_birth DATE NOT NULL,
    nid_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'pending_review')),
    verification_score INTEGER DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
    ocr_data JSONB,
    admin_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nid_user_id ON nid_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_nid_number ON nid_verifications(nid_number);
CREATE INDEX IF NOT EXISTS idx_nid_status ON nid_verifications(status);
CREATE INDEX IF NOT EXISTS idx_nid_created_at ON nid_verifications(created_at DESC);

-- 3. Create unique constraint for verified NIDs (one NID can only be verified once)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_verified_nid 
ON nid_verifications(nid_number) 
WHERE status = 'verified';

-- 4. Add nid_verified column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nid_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 5. Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nid_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_nid_verification_updated_at ON nid_verifications;

CREATE TRIGGER trigger_nid_verification_updated_at
    BEFORE UPDATE ON nid_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_nid_verification_timestamp();

-- 6. Create storage bucket for NID images (if not exists)
-- Note: You may need to create this bucket manually in Supabase Storage UI
-- Bucket name: verifications
-- Public: No (private bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Set up Row Level Security (RLS) policies
ALTER TABLE nid_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verifications
CREATE POLICY "Users can view own verifications"
ON nid_verifications
FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own verifications
CREATE POLICY "Users can create own verifications"
ON nid_verifications
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their pending verifications
CREATE POLICY "Users can update own pending verifications"
ON nid_verifications
FOR UPDATE
USING (auth.uid()::text = user_id::text AND status = 'pending');

-- 8. Add comments for documentation
COMMENT ON TABLE nid_verifications IS 'Stores Bangladesh NID verification records';
COMMENT ON COLUMN nid_verifications.nid_number IS 'Bangladesh NID: 10, 13, or 17 digits';
COMMENT ON COLUMN nid_verifications.status IS 'Verification status: pending, verified, rejected, pending_review';
COMMENT ON COLUMN nid_verifications.verification_score IS 'Automated verification score (0-100)';
COMMENT ON COLUMN nid_verifications.ocr_data IS 'OCR extraction results from NID image (JSON format)';
COMMENT ON COLUMN nid_verifications.nid_image_url IS 'URL to uploaded NID card image in storage';

-- Success message
SELECT 'NID Verification System setup completed successfully!' AS message;

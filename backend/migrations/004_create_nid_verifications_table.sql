-- Create NID verifications table
CREATE TABLE IF NOT EXISTS nid_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nid_number VARCHAR(17) NOT NULL,
    date_of_birth DATE NOT NULL,
    nid_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verification_score INTEGER DEFAULT 0,
    ocr_data JSONB,
    admin_notes TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nid_user_id ON nid_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_nid_number ON nid_verifications(nid_number);
CREATE INDEX IF NOT EXISTS idx_nid_status ON nid_verifications(status);

-- Add unique constraint for verified NIDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_verified_nid 
ON nid_verifications(nid_number) 
WHERE status = 'verified';

-- Add nid_verified column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nid_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_nid_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_nid_verification_updated_at ON nid_verifications;

CREATE TRIGGER trigger_update_nid_verification_updated_at
BEFORE UPDATE ON nid_verifications
FOR EACH ROW
EXECUTE FUNCTION update_nid_verification_updated_at();

-- Create storage bucket for NID images (Run this in Supabase Dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('verifications', 'verifications', false);

COMMENT ON TABLE nid_verifications IS 'Stores Bangladesh NID verification records';
COMMENT ON COLUMN nid_verifications.status IS 'Status: pending, verified, rejected, pending_review';
COMMENT ON COLUMN nid_verifications.verification_score IS 'Automated verification score (0-100)';
COMMENT ON COLUMN nid_verifications.ocr_data IS 'OCR extraction results from NID image';

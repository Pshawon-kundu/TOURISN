-- Create guide_verifications table for NID verification
CREATE TABLE IF NOT EXISTS guide_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  nid_number VARCHAR(20) NOT NULL UNIQUE,
  nid_image_url TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guide_online_status table for real-time status tracking
CREATE TABLE IF NOT EXISTS guide_online_status (
  guide_id UUID PRIMARY KEY REFERENCES guides(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guide_verifications_guide_id ON guide_verifications(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_verifications_status ON guide_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_guide_verifications_nid ON guide_verifications(nid_number);
CREATE INDEX IF NOT EXISTS idx_guide_online_status_online ON guide_online_status(is_online);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guide_verifications_updated_at
    BEFORE UPDATE ON guide_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_online_status_updated_at
    BEFORE UPDATE ON guide_online_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE guide_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_online_status ENABLE ROW LEVEL SECURITY;

-- Guides can view their own verification status
CREATE POLICY "Guides can view own verification"
  ON guide_verifications FOR SELECT
  USING (guide_id IN (SELECT id FROM guides WHERE user_id = auth.uid()));

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
  ON guide_verifications FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Anyone can view guide online status (for chat)
CREATE POLICY "Anyone can view guide status"
  ON guide_online_status FOR SELECT
  USING (true);

-- Guides can update their own status
CREATE POLICY "Guides can update own status"
  ON guide_online_status FOR ALL
  USING (guide_id IN (SELECT id FROM guides WHERE user_id = auth.uid()));

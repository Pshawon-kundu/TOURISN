-- Enhanced Security Tables for NID Verification System
-- Run this script in Supabase SQL Editor

-- 1. Create verification logs table for security monitoring
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nid_number_hash VARCHAR(64) NOT NULL, -- SHA256 hash of NID for privacy
    verification_status VARCHAR(30) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    ip_address INET,
    ocr_confidence DECIMAL(3,2),
    suspicious_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create rate limiting table
CREATE TABLE IF NOT EXISTS verification_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempts_count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Create suspicious activity tracking
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL, -- 'multiple_nids', 'low_ocr_confidence', 'rapid_attempts', etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Update NID verifications table with additional security fields (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nid_verifications') THEN
        ALTER TABLE nid_verifications 
        ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS ocr_details JSONB,
        ADD COLUMN IF NOT EXISTS image_hash VARCHAR(64), -- SHA256 hash of uploaded image
        ADD COLUMN IF NOT EXISTS ip_address INET,
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
        ADD COLUMN IF NOT EXISTS manual_review_notes TEXT,
        ADD COLUMN IF NOT EXISTS reviewed_by UUID,
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
        
        -- Add foreign key constraint separately if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'nid_verifications_reviewed_by_fkey'
            AND table_name = 'nid_verifications'
        ) THEN
            ALTER TABLE nid_verifications 
            ADD CONSTRAINT nid_verifications_reviewed_by_fkey 
            FOREIGN KEY (reviewed_by) REFERENCES users(id);
        END IF;
    END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_verification_logs_status ON verification_logs(verification_status);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON verification_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON verification_rate_limits(blocked_until);

CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_resolved ON security_incidents(resolved_at);

-- Only create nid_verifications indexes if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nid_verifications') THEN
        CREATE INDEX IF NOT EXISTS idx_nid_security_flags ON nid_verifications USING GIN (security_flags);
        CREATE INDEX IF NOT EXISTS idx_nid_ip_address ON nid_verifications(ip_address);
    END IF;
END $$;

-- 6. Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_verification_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist before creating
DROP TRIGGER IF EXISTS trigger_update_verification_logs_updated_at ON verification_logs;
CREATE TRIGGER trigger_update_verification_logs_updated_at
BEFORE UPDATE ON verification_logs
FOR EACH ROW
EXECUTE FUNCTION update_verification_logs_updated_at();

DROP TRIGGER IF EXISTS trigger_update_rate_limits_updated_at ON verification_rate_limits;
CREATE TRIGGER trigger_update_rate_limits_updated_at
BEFORE UPDATE ON verification_rate_limits
FOR EACH ROW
EXECUTE FUNCTION update_verification_logs_updated_at();

-- 7. Create function to automatically clean old logs (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_verification_logs()
RETURNS void AS $$
BEGIN
    -- Delete logs older than 2 years
    DELETE FROM verification_logs 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Delete resolved security incidents older than 1 year
    DELETE FROM security_incidents 
    WHERE resolved_at IS NOT NULL 
    AND resolved_at < NOW() - INTERVAL '1 year';
    
    -- Update rate limits table by removing old records
    DELETE FROM verification_rate_limits
    WHERE last_attempt_at < NOW() - INTERVAL '7 days'
    AND blocked_until IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Create admin view for monitoring verification attempts (only if nid_verifications exists)
DROP VIEW IF EXISTS admin_verification_summary;

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nid_verifications') THEN
        EXECUTE '
        CREATE OR REPLACE VIEW admin_verification_summary AS
        SELECT 
            u.id as user_id,
            u.email,
            CONCAT(u.first_name, '' '', u.last_name) as full_name,
            nv.nid_number,
            nv.status,
            nv.verification_score,
            nv.created_at as verification_date,
            CASE 
                WHEN nv.security_flags::jsonb ? ''high_risk'' THEN ''🔴 High Risk''
                WHEN nv.security_flags::jsonb ? ''medium_risk'' THEN ''🟡 Medium Risk''
                ELSE ''🟢 Normal''
            END as risk_level,
            (
                SELECT COUNT(*) 
                FROM verification_logs vl 
                WHERE vl.user_id = u.id 
                AND vl.created_at > NOW() - INTERVAL ''24 hours''
            ) as attempts_24h
        FROM users u
        LEFT JOIN nid_verifications nv ON u.id = nv.user_id
        WHERE nv.id IS NOT NULL
        ORDER BY nv.created_at DESC';
    END IF;
END $$;

-- 9. Create RLS (Row Level Security) policies
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verification logs" ON verification_logs;
DROP POLICY IF EXISTS "Admins can view all verification logs" ON verification_logs;
DROP POLICY IF EXISTS "System manages rate limits" ON verification_rate_limits;
DROP POLICY IF EXISTS "Only admins can manage security incidents" ON security_incidents;

-- Users can only see their own logs
CREATE POLICY "Users can view own verification logs" ON verification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins can view all logs
CREATE POLICY "Admins can view all verification logs" ON verification_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role = 'moderator')
        )
    );

-- Rate limits are system-managed
CREATE POLICY "System manages rate limits" ON verification_rate_limits
    FOR ALL USING (true);

-- Security incidents are admin-only
CREATE POLICY "Only admins can manage security incidents" ON security_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 10. Add comments for documentation
COMMENT ON TABLE verification_logs IS 'Logs all NID verification attempts for security monitoring and analytics';
COMMENT ON TABLE verification_rate_limits IS 'Tracks rate limiting for NID verification attempts per user';
COMMENT ON TABLE security_incidents IS 'Records suspicious activities and security incidents for investigation';

COMMENT ON COLUMN verification_logs.nid_number_hash IS 'SHA256 hash of NID number for privacy protection';
COMMENT ON COLUMN verification_logs.suspicious_flags IS 'Array of detected suspicious activity flags';

-- Only add comments for nid_verifications if table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nid_verifications') THEN
        COMMENT ON COLUMN nid_verifications.security_flags IS 'Security-related flags and warnings for this verification';
        COMMENT ON COLUMN nid_verifications.ocr_details IS 'Detailed OCR processing results and metadata';
        COMMENT ON COLUMN nid_verifications.image_hash IS 'SHA256 hash of uploaded image to detect duplicates';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced NID verification security system installed successfully!';
    RAISE NOTICE 'New tables created: verification_logs, verification_rate_limits, security_incidents';
    RAISE NOTICE 'Enhanced nid_verifications table with security fields';
    RAISE NOTICE 'Security policies and monitoring views configured';
END $$;
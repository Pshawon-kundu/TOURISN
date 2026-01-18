-- Complete Admin System with Security & Activity Logging
-- Run this in Supabase SQL Editor

-- 1. Create admin_users table (separate from regular users for security)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- 'user_approved', 'user_blocked', 'booking_modified', etc.
    target_type VARCHAR(50), -- 'user', 'booking', 'guide', etc.
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_status_changes table
CREATE TABLE IF NOT EXISTS user_status_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admin_users(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create billing_transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'commission'
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_ref VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add admin approval fields to users table
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS approved_by UUID,
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS status_reason TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_approved_by_fkey'
        ) THEN
            ALTER TABLE users 
            ADD CONSTRAINT users_approved_by_fkey 
            FOREIGN KEY (approved_by) REFERENCES admin_users(id);
        END IF;
    END IF;
END $$;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_booking_id ON billing_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_created ON billing_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_status_changes_user ON user_status_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_changes_admin ON user_status_changes(admin_id);

-- 8. Create security functions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID,
    p_action_type VARCHAR,
    p_target_type VARCHAR DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO admin_activity_logs (
        admin_id, action_type, target_type, target_id, 
        details, ip_address, user_agent
    ) VALUES (
        p_admin_id, p_action_type, p_target_type, p_target_id,
        p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create admin statistics view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE approval_status = 'pending') as pending_users,
    (SELECT COUNT(*) FROM users WHERE account_status = 'active') as active_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours') as new_users_today,
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE booking_status = 'pending') as pending_bookings,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE payment_status = 'completed') as total_revenue,
    (SELECT COALESCE(SUM(total_price), 0) FROM bookings 
     WHERE payment_status = 'completed' 
     AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue;

-- 10. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Only super admins can manage admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can view own sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Admins can view own activity" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can view billing" ON billing_transactions;

-- Create RLS policies
CREATE POLICY "Only super admins can manage admins" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Admins can view own sessions" ON admin_sessions
    FOR ALL USING (admin_id = auth.uid());

CREATE POLICY "Admins can view own activity" ON admin_activity_logs
    FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can view billing" ON billing_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    );

-- 11. Insert default super admin (password: Admin@123456 - CHANGE THIS!)
INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
    'admin@tourisn.com',
    '$2b$10$rGfJ7qQZKxFE0Y9QP7LkXOxPnq2MQH5YvXJ3/qJXxC3FYvH9Qo4JG', -- Admin@123456
    'Super Administrator',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin system installed successfully!';
    RAISE NOTICE '📊 Tables created: admin_users, admin_sessions, admin_activity_logs, billing_transactions';
    RAISE NOTICE '🔐 Default admin: admin@tourisn.com / Admin@123456';
    RAISE NOTICE '⚠️  IMPORTANT: Change the default admin password immediately!';
END $$;

-- Create experience_bookings table for storing experience bookings
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS experience_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    experience_id VARCHAR(50) NOT NULL,
    experience_name VARCHAR(255) NOT NULL,
    experience_image TEXT,
    location VARCHAR(255),
    region VARCHAR(255),
    guide_name VARCHAR(255),
    guide_avatar TEXT,
    guests INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BDT',
    status VARCHAR(50) DEFAULT 'pending',
    booking_date TIMESTAMPTZ DEFAULT NOW(),
    experience_date TIMESTAMPTZ,
    experience_time VARCHAR(10),
    duration VARCHAR(100),
    meeting_point TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_experience_bookings_user_id ON experience_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_status ON experience_bookings(status);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_booking_date ON experience_bookings(booking_date);

-- Enable RLS (Row Level Security)
ALTER TABLE experience_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own experience bookings" ON experience_bookings
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can insert experience bookings" ON experience_bookings
    FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own bookings
CREATE POLICY "Users can update own experience bookings" ON experience_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Create saved_experiences table for favorites
CREATE TABLE IF NOT EXISTS saved_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    experience_id VARCHAR(50) NOT NULL,
    experience_name VARCHAR(255),
    experience_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, experience_id)
);

-- Enable RLS for saved_experiences
ALTER TABLE saved_experiences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own saved experiences
CREATE POLICY "Users can view own saved experiences" ON saved_experiences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert saved experiences" ON saved_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete saved experiences" ON saved_experiences
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_experience_bookings_updated_at
    BEFORE UPDATE ON experience_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT ALL ON experience_bookings TO authenticated;
GRANT ALL ON saved_experiences TO authenticated;

-- Also grant access to anonymous users for demo mode
GRANT INSERT, SELECT ON experience_bookings TO anon;

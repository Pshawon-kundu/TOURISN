-- Migration: Create combined_bookings table for room + guide bookings
-- Run this in Supabase SQL Editor

-- Create combined_bookings table for complete trip bookings
CREATE TABLE IF NOT EXISTS combined_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Main booking reference
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  
  -- Experience/Trip details
  experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  experience_name VARCHAR(255),
  experience_category VARCHAR(50),
  experience_location VARCHAR(255),
  experience_duration VARCHAR(100),
  experience_price DECIMAL(10, 2),
  
  -- Stay/Room details
  stay_booking_id UUID REFERENCES stay_bookings(id) ON DELETE SET NULL,
  room_type VARCHAR(100),
  room_price_per_night DECIMAL(10, 2),
  check_in_date DATE,
  check_out_date DATE,
  number_of_nights INTEGER,
  room_total DECIMAL(10, 2),
  
  -- Guide details
  guide_id UUID REFERENCES guides(id) ON DELETE SET NULL,
  guide_name VARCHAR(255),
  guide_rate_per_hour DECIMAL(10, 2),
  guide_hours INTEGER,
  guide_total DECIMAL(10, 2),
  
  -- Travel details
  from_location VARCHAR(255),
  to_location VARCHAR(255),
  travel_date DATE,
  number_of_travelers INTEGER DEFAULT 1,
  
  -- Traveler info
  traveler_name VARCHAR(255) NOT NULL,
  traveler_email VARCHAR(255),
  traveler_phone VARCHAR(50),
  special_requests TEXT,
  
  -- Pricing breakdown
  subtotal DECIMAL(10, 2),
  taxes DECIMAL(10, 2) DEFAULT 0,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  
  -- Payment details
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference VARCHAR(255),
  card_last_four VARCHAR(4),
  
  -- Booking status
  booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_combined_bookings_user_id ON combined_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_experience_id ON combined_bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_guide_id ON combined_bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_status ON combined_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_payment_status ON combined_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_created_at ON combined_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_combined_bookings_reference ON combined_bookings(booking_reference);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_combined_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_combined_bookings_updated_at ON combined_bookings;
CREATE TRIGGER trigger_combined_bookings_updated_at
  BEFORE UPDATE ON combined_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_combined_bookings_updated_at();

-- Enable RLS
ALTER TABLE combined_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own combined bookings" ON combined_bookings;
CREATE POLICY "Users can view their own combined bookings" ON combined_bookings
  FOR SELECT USING (user_id::text = auth.uid()::text OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create combined bookings" ON combined_bookings;
CREATE POLICY "Users can create combined bookings" ON combined_bookings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own combined bookings" ON combined_bookings;
CREATE POLICY "Users can update their own combined bookings" ON combined_bookings
  FOR UPDATE USING (user_id::text = auth.uid()::text OR user_id IS NULL);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON combined_bookings TO anon;
GRANT SELECT, INSERT, UPDATE ON combined_bookings TO authenticated;
GRANT ALL ON combined_bookings TO service_role;

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  ref TEXT;
BEGIN
  ref := 'TUR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
  RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Add guide_id to bookings table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'guide_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guide_id UUID REFERENCES guides(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_bookings_guide_id ON bookings(guide_id);
  END IF;
END $$;

-- Add guide booking fields to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'guide_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guide_name VARCHAR(255);
    ALTER TABLE bookings ADD COLUMN guide_rate DECIMAL(10, 2);
    ALTER TABLE bookings ADD COLUMN guide_hours INTEGER;
  END IF;
END $$;

-- Verify the schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'combined_bookings' 
ORDER BY ordinal_position;

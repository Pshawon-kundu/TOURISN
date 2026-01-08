-- ============================================
-- DROP OLD BOOKINGS TABLE AND CREATE NEW ONE
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing bookings table (WARNING: This will delete all existing booking data!)
DROP TABLE IF EXISTS bookings CASCADE;

-- Create new bookings table with updated schema
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('stay', 'transport', 'guide', 'experience')),
  
  -- Trip details
  trip_name VARCHAR(255),
  location VARCHAR(255),
  check_in_date TIMESTAMP,
  check_out_date TIMESTAMP,
  guests INTEGER DEFAULT 1 CHECK (guests > 0),
  
  -- Item details
  item_id VARCHAR(255),
  item_name VARCHAR(255),
  item_image TEXT,
  
  -- Pricing
  price_per_unit DECIMAL(10, 2) CHECK (price_per_unit >= 0),
  total_days_or_units INTEGER CHECK (total_days_or_units > 0),
  subtotal DECIMAL(10, 2) CHECK (subtotal >= 0),
  service_fee DECIMAL(10, 2) DEFAULT 0 CHECK (service_fee >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  currency VARCHAR(10) DEFAULT 'TK',
  
  -- Payment info
  payment_method VARCHAR(50),
  payment_number VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Booking status
  booking_status VARCHAR(50) DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_booking_type ON bookings(booking_type);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete their own bookings" ON bookings
  FOR DELETE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Verify table creation
SELECT 'Bookings table created successfully with RLS enabled!' as status;

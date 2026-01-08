-- Create bookings table if not exists
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_type VARCHAR(50) NOT NULL, -- 'stay', 'transport', 'guide', 'experience'
  
  -- Trip details
  trip_name VARCHAR(255),
  location VARCHAR(255),
  check_in_date TIMESTAMP,
  check_out_date TIMESTAMP,
  guests INTEGER DEFAULT 1,
  
  -- Item details (generic fields for all booking types)
  item_id VARCHAR(255), -- Reference to the specific item (stay_id, guide_id, etc)
  item_name VARCHAR(255),
  item_image TEXT,
  
  -- Pricing
  price_per_unit DECIMAL(10, 2),
  total_days_or_units INTEGER,
  subtotal DECIMAL(10, 2),
  service_fee DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TK',
  
  -- Payment info
  payment_method VARCHAR(50),
  payment_number VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Booking status
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

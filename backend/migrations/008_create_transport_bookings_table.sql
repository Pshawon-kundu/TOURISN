-- Drop existing table and related objects if they exist
DROP TRIGGER IF EXISTS trigger_update_transport_bookings_timestamp ON transport_bookings CASCADE;
DROP FUNCTION IF EXISTS update_transport_bookings_updated_at() CASCADE;
DROP TABLE IF EXISTS transport_bookings CASCADE;

-- Create transport_bookings table for detailed transport-specific information
CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Route details
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(10, 2),
  
  -- Transport details
  transport_type VARCHAR(50) NOT NULL, -- 'car', 'bus', 'train', etc.
  transport_name VARCHAR(255),
  
  -- Travel details
  travel_date DATE NOT NULL,
  passengers INTEGER DEFAULT 1,
  
  -- Pricing breakdown
  base_fare DECIMAL(10, 2) NOT NULL,
  per_passenger_fare DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) DEFAULT 50,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment details
  payment_method VARCHAR(50) NOT NULL, -- 'bkash', 'nagad', 'rocket', 'card'
  payment_number VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  transaction_id VARCHAR(255),
  
  -- Status
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transport_bookings_booking_id ON transport_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_user_id ON transport_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_travel_date ON transport_bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_status ON transport_bookings(booking_status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_transport_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transport_bookings_timestamp
BEFORE UPDATE ON transport_bookings
FOR EACH ROW
EXECUTE FUNCTION update_transport_bookings_updated_at();

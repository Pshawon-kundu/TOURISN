-- Create saved_places table
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_type VARCHAR(50) NOT NULL, -- 'stay', 'experience', 'transport', 'guide'
  place_id UUID NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  place_image TEXT,
  place_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, place_type, place_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'stay', 'experience', 'transport', 'guide'
  item_id UUID NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Add address and date_of_birth columns to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

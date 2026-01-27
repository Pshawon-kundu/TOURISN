-- Migration: Create experiences table with proper structure for Featured Trips and Find Experiences
-- Run this in Supabase SQL Editor

-- Drop existing experiences table if needed (comment out if you want to preserve data)
-- DROP TABLE IF EXISTS experiences CASCADE;

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES guides(id) ON DELETE SET NULL,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('adventure', 'cultural', 'nature', 'wellness', 'food')),
  
  -- Location
  location VARCHAR(255) NOT NULL,
  region VARCHAR(255),
  meeting_point TEXT,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  
  -- Duration and difficulty
  duration VARCHAR(100), -- e.g., "4 hours", "Full day", "2 days 1 night"
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  
  -- Capacity
  group_size VARCHAR(50), -- e.g., "2-6 people"
  max_participants INTEGER DEFAULT 10,
  min_age INTEGER,
  
  -- Ratings
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  -- Images
  image TEXT, -- Main image URL
  images TEXT[] DEFAULT '{}', -- Additional images
  
  -- Details arrays
  highlights TEXT[] DEFAULT '{}',
  included TEXT[] DEFAULT '{}',
  not_included TEXT[] DEFAULT '{}',
  best_season TEXT[] DEFAULT '{}',
  
  -- Physical requirements and policies
  physical_requirement TEXT,
  cancellation TEXT,
  
  -- Guide info (embedded for quick access)
  guide_name VARCHAR(255),
  guide_avatar TEXT,
  guide_languages TEXT[] DEFAULT '{}',
  guide_experience INTEGER, -- years
  guide_rating DECIMAL(3, 2),
  
  -- Featured flag
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_is_featured ON experiences(is_featured);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_rating ON experiences(rating DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_guide_id ON experiences(guide_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_experiences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_experiences_updated_at ON experiences;
CREATE TRIGGER trigger_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_experiences_updated_at();

-- Enable RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active experiences" ON experiences;
CREATE POLICY "Anyone can view active experiences" ON experiences
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Guides can manage their own experiences" ON experiences;
CREATE POLICY "Guides can manage their own experiences" ON experiences
  FOR ALL USING (guide_id::text = auth.uid()::text);

-- Insert seed data for Featured Trips and Experiences
INSERT INTO experiences (
  id, name, title, description, category, location, region, price, currency, 
  duration, difficulty, group_size, max_participants, min_age,
  rating, reviews_count, image, highlights, included, not_included,
  meeting_point, guide_name, guide_avatar, guide_languages, guide_experience, guide_rating,
  best_season, physical_requirement, cancellation, is_featured, featured_order, status
) VALUES 
-- Experience 1: Cox's Bazar Beach Sunrise & Surfing (FEATURED)
(
  'e1a00000-0000-0000-0000-000000000001',
  'Cox''s Bazar Beach Sunrise & Surfing',
  'Cox''s Bazar Beach Escape',
  'Watch the sunrise over the longest natural sea beach in Bangladesh while learning to surf. Professional instructors guide you through basic techniques.',
  'adventure',
  'Cox''s Bazar',
  'Chittagong Division',
  2500,
  'BDT',
  '4 hours',
  'moderate',
  '2-6 people',
  6,
  12,
  4.9,
  287,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  ARRAY['Stunning sunrise views', 'Professional surfing lesson', 'Beach photography session', 'Traditional breakfast included'],
  ARRAY['Surfboard rental', 'Professional instructor', 'Insurance', 'Breakfast', 'Hotel pickup/dropoff'],
  ARRAY['Photography prints', 'Extra rental equipment'],
  'Cox''s Bazar Beach Main Gate',
  'Rauf Ahmed',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['Bengali', 'English'],
  8,
  4.9,
  ARRAY['October', 'November', 'December', 'January', 'February'],
  'Moderate fitness level required',
  'Free cancellation up to 24 hours before',
  true,
  1,
  'active'
),
-- Experience 2: Bandarban Hill Trek (FEATURED)
(
  'e1a00000-0000-0000-0000-000000000002',
  'Bandarban Hill Trek & Tribal Village Tour',
  'Bandarban Hill Trails',
  'Trek through lush hills, visit authentic tribal villages, and experience the unique culture of the Marma people. Includes traditional meals and homestay interaction.',
  'nature',
  'Bandarban',
  'Chittagong Hill Tracts',
  3500,
  'BDT',
  'Full day (8 hours)',
  'challenging',
  '3-8 people',
  8,
  10,
  4.8,
  412,
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
  ARRAY['Scenic hill trek', 'Visit Marma tribal villages', 'Lunch with local family', 'Sunset viewpoint', 'Traditional crafts workshop'],
  ARRAY['Guide', 'All meals', 'Trek equipment', 'Transportation', 'Insurance'],
  ARRAY['Souvenirs', 'Tips for guide'],
  'Bandarban Main Bus Station',
  'Kamal Chakma',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  ARRAY['Bengali', 'English', 'Marma'],
  12,
  4.8,
  ARRAY['November', 'December', 'January', 'February', 'March'],
  'High fitness level required',
  'Free cancellation up to 48 hours before',
  true,
  2,
  'active'
),
-- Experience 3: Sundarbans Wildlife Safari
(
  'e1a00000-0000-0000-0000-000000000003',
  'Sundarbans Wildlife Safari',
  'Sundarbans Adventure',
  'Explore the world''s largest mangrove forest and home to the Royal Bengal Tiger. Experience pristine wilderness with expert naturalist guides.',
  'nature',
  'Sundarbans',
  'Khulna Division',
  4200,
  'BDT',
  '2 days 1 night',
  'easy',
  '4-10 people',
  10,
  6,
  4.7,
  98,
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
  ARRAY['Wildlife spotting (Tiger, Deer, Crocodile)', 'Mangrove forest exploration', 'River cruise through channels', 'Bird watching (over 300 species)', 'Traditional fishing village visit'],
  ARRAY['Boat accommodation', 'All meals', 'Expert naturalist guide', 'Entry permits', 'Binoculars', 'Life jackets'],
  ARRAY['Photography equipment', 'Personal expenses', 'Tips'],
  'Mongla Port, Khulna',
  'Rashidul Hassan',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  ARRAY['Bengali', 'English'],
  12,
  4.7,
  ARRAY['October', 'November', 'December', 'January', 'February'],
  'Easy - suitable for all ages',
  'Free cancellation up to 48 hours before',
  false,
  NULL,
  'active'
),
-- Experience 4: Sajek Valley Camping (FEATURED)
(
  'e1a00000-0000-0000-0000-000000000004',
  'Sajek Valley Camping & Stargazing',
  'Sajek Valley Escape',
  'Experience the magic of Sajek Valley with camping under the stars. Wake up to misty mountains and enjoy authentic hill cuisine.',
  'adventure',
  'Sajek Valley',
  'Chittagong Hill Tracts',
  5500,
  'BDT',
  '2 days 1 night',
  'moderate',
  '4-12 people',
  12,
  8,
  4.9,
  189,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  ARRAY['Scenic camping site', 'Stargazing session', 'Mountain photography', 'Sunrise trek', 'Bonfire & cultural show'],
  ARRAY['Tent accommodation', 'All meals', 'Guide', 'Transportation', 'Camping equipment'],
  ARRAY['Sleeping bag rental'],
  'Rangamati Bus Stand',
  'Arjun Tripura',
  'https://images.unsplash.com/photo-1496345875519-c21a7dc4d881?w=400',
  ARRAY['Bengali', 'English', 'Chakma'],
  10,
  4.9,
  ARRAY['November', 'December', 'January', 'February'],
  'Moderate fitness required',
  'Free cancellation up to 72 hours before',
  true,
  3,
  'active'
),
-- Experience 5: Old Dhaka Walking Tour
(
  'e1a00000-0000-0000-0000-000000000005',
  'Old Dhaka Walking Tour & Street Food',
  'Old Dhaka Heritage Walk',
  'Wander through the historic lanes of Old Dhaka, visit ancient mosques and temples, and taste authentic street food at local vendors.',
  'cultural',
  'Dhaka',
  'Dhaka Division',
  1800,
  'BDT',
  '4 hours',
  'easy',
  '2-8 people',
  8,
  6,
  4.6,
  523,
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
  ARRAY['Historic monuments', 'Street food tasting', 'Local markets', 'Photography spots', 'Cultural stories & history'],
  ARRAY['Guide', 'Street food samples', 'Transportation between sites'],
  ARRAY['Full meals', 'Shopping'],
  'Baitul Mukarram Mosque',
  'Nasrin Akter',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  ARRAY['Bengali', 'English', 'Hindi'],
  9,
  4.6,
  ARRAY['October', 'November', 'December', 'January', 'February'],
  'Easy - lots of walking',
  'Free cancellation up to 6 hours before',
  false,
  NULL,
  'active'
),
-- Experience 6: Sylhet Tea Garden Escape (FEATURED)
(
  'e1a00000-0000-0000-0000-000000000006',
  'Sylhet Tea Garden Escape',
  'Sylhet Tea Garden Tour',
  'Explore the beautiful tea gardens of Sylhet, learn about tea processing, and enjoy panoramic views of rolling green hills.',
  'nature',
  'Sylhet',
  'Sylhet Division',
  2000,
  'BDT',
  '5 hours',
  'easy',
  '2-10 people',
  10,
  5,
  4.7,
  356,
  'https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=800',
  ARRAY['Tea garden tour', 'Tea processing demonstration', 'Fresh tea tasting', 'Scenic viewpoints', 'Local market visit'],
  ARRAY['Guide', 'Tea tasting', 'Light snacks', 'Transportation'],
  ARRAY['Lunch', 'Shopping'],
  'Sylhet Airport Gate',
  'Mohammad Iqbal',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  ARRAY['Bengali', 'English'],
  6,
  4.7,
  ARRAY['March', 'April', 'October', 'November'],
  'Easy - suitable for all',
  'Free cancellation up to 12 hours before',
  true,
  4,
  'active'
),
-- Experience 7: Chittagong Hill Tracts Cultural Immersion
(
  'e1a00000-0000-0000-0000-000000000007',
  'Chittagong Hill Tracts Cultural Immersion',
  'Hill Tracts Culture Tour',
  'Immerse yourself in the unique cultures of indigenous communities. Visit traditional villages, participate in local festivals, and learn ancient crafts.',
  'cultural',
  'Rangamati',
  'Chittagong Hill Tracts',
  3800,
  'BDT',
  'Full day (10 hours)',
  'moderate',
  '4-8 people',
  8,
  8,
  4.8,
  167,
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
  ARRAY['Indigenous village visits', 'Traditional craft workshop', 'Cultural dance performance', 'Lake boat ride', 'Authentic tribal lunch'],
  ARRAY['Expert guide', 'All transportation', 'Traditional lunch', 'Craft materials', 'Boat ride'],
  ARRAY['Personal purchases', 'Tips'],
  'Rangamati Boat Ghat',
  'Chandra Chakma',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['Bengali', 'English', 'Chakma', 'Marma'],
  15,
  4.8,
  ARRAY['October', 'November', 'December', 'January', 'February', 'March'],
  'Moderate - some walking required',
  'Free cancellation up to 24 hours before',
  false,
  NULL,
  'active'
),
-- Experience 8: Saint Martin Island Diving
(
  'e1a00000-0000-0000-0000-000000000008',
  'Saint Martin Island Diving & Snorkeling',
  'Saint Martin Underwater Adventure',
  'Discover the crystal-clear waters of Saint Martin Island with guided diving and snorkeling. See colorful coral reefs and marine life.',
  'adventure',
  'Saint Martin Island',
  'Chittagong Division',
  6500,
  'BDT',
  '2 days 1 night',
  'moderate',
  '2-6 people',
  6,
  15,
  4.9,
  234,
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  ARRAY['Diving session', 'Snorkeling equipment', 'Coral reef exploration', 'Beach time', 'Sunset viewing'],
  ARRAY['Diving equipment', 'Certified instructor', 'Island accommodation', 'All meals', 'Boat transfers'],
  ARRAY['Personal gear', 'Photography', 'Tips'],
  'Teknaf Boat Terminal',
  'Fahim Rahman',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  ARRAY['Bengali', 'English'],
  7,
  4.9,
  ARRAY['November', 'December', 'January', 'February', 'March'],
  'Swimming ability required',
  'Free cancellation up to 72 hours before',
  false,
  NULL,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  region = EXCLUDED.region,
  price = EXCLUDED.price,
  duration = EXCLUDED.duration,
  difficulty = EXCLUDED.difficulty,
  group_size = EXCLUDED.group_size,
  max_participants = EXCLUDED.max_participants,
  min_age = EXCLUDED.min_age,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  image = EXCLUDED.image,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  not_included = EXCLUDED.not_included,
  meeting_point = EXCLUDED.meeting_point,
  guide_name = EXCLUDED.guide_name,
  guide_avatar = EXCLUDED.guide_avatar,
  guide_languages = EXCLUDED.guide_languages,
  guide_experience = EXCLUDED.guide_experience,
  guide_rating = EXCLUDED.guide_rating,
  best_season = EXCLUDED.best_season,
  physical_requirement = EXCLUDED.physical_requirement,
  cancellation = EXCLUDED.cancellation,
  is_featured = EXCLUDED.is_featured,
  featured_order = EXCLUDED.featured_order,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Grant permissions
GRANT SELECT ON experiences TO anon;
GRANT SELECT ON experiences TO authenticated;
GRANT ALL ON experiences TO service_role;

-- Verify the data
SELECT id, name, category, location, price, rating, is_featured, featured_order 
FROM experiences 
ORDER BY featured_order NULLS LAST, rating DESC;

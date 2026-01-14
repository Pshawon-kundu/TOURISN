-- Add expertise categories and coverage areas to guides table
ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS expertise_categories JSONB DEFAULT '[]'::jsonb;

ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS coverage_areas JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN guides.expertise_categories IS 'Guide expertise categories as JSON array';
COMMENT ON COLUMN guides.coverage_areas IS 'Districts/areas the guide can cover as JSON array';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guides_expertise_categories ON guides USING GIN (expertise_categories);
CREATE INDEX IF NOT EXISTS idx_guides_coverage_areas ON guides USING GIN (coverage_areas);
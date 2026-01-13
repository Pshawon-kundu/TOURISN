-- Add per_hour_rate column to guides table
ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS per_hour_rate DECIMAL(10, 2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN guides.per_hour_rate IS 'Guide hourly rate in BDT';

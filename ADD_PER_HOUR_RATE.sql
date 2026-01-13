-- Run this SQL in Supabase SQL Editor
-- Adds per_hour_rate column to guides table for storing guide hourly rates

-- Add per_hour_rate column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='guides' AND column_name='per_hour_rate'
    ) THEN
        ALTER TABLE guides 
        ADD COLUMN per_hour_rate DECIMAL(10, 2) DEFAULT 0;
        
        -- Add comment
        COMMENT ON COLUMN guides.per_hour_rate IS 'Guide hourly rate in BDT';
        
        RAISE NOTICE 'Column per_hour_rate added successfully';
    ELSE
        RAISE NOTICE 'Column per_hour_rate already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'guides' AND column_name = 'per_hour_rate';

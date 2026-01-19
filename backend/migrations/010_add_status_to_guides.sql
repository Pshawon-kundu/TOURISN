-- Add status column to guides table if it doesn't exist
ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint for status values
DO $$ 
BEGIN 
    -- Drop constraint if it exists to ensure we have the latest one
    ALTER TABLE guides DROP CONSTRAINT IF EXISTS guides_status_check;
    
    -- Add the constraint
    ALTER TABLE guides 
    ADD CONSTRAINT guides_status_check 
    CHECK (status IN ('active', 'pending', 'suspended', 'rejected'));
END $$;

-- Create index for status column
CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status);

-- Update existing NULL status to pending
UPDATE guides SET status = 'pending' WHERE status IS NULL;

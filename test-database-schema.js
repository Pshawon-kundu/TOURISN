import { createClient } from "@supabase/supabase-js";

// You'll need to get these from your Supabase dashboard
const supabaseUrl = "your-supabase-url";
const supabaseKey = "your-supabase-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  try {
    // Test if the new columns exist by querying the guides table
    const { data, error } = await supabase
      .from("guides")
      .select("id, expertise_categories, coverage_areas")
      .limit(1);

    if (error) {
      console.log("❌ Database schema test failed:", error.message);

      if (
        error.message.includes("column") &&
        error.message.includes("does not exist")
      ) {
        console.log("💡 New columns need to be added to the database.");
        console.log("Please run this SQL in your Supabase SQL editor:");
        console.log(`
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
        `);
      }
    } else {
      console.log("✅ Database schema is ready with new columns");
      console.log("Sample data:", data);
    }
  } catch (err) {
    console.log("❌ Connection error:", err);
  }
}

testDatabaseSchema();

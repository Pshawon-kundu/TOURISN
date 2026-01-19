import { supabase } from "../config/supabase";

async function applyStatusMigration() {
  console.log("🔄 Starting guides status migration...");

  const queries = [
    // 1. Add status column
    "ALTER TABLE guides ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",

    // 2. Drop existing constraint if any
    "ALTER TABLE guides DROP CONSTRAINT IF EXISTS guides_status_check;",

    // 3. Add constraint
    "ALTER TABLE guides ADD CONSTRAINT guides_status_check CHECK (status IN ('active', 'pending', 'suspended', 'rejected'));",

    // 4. Create index
    "CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status);",

    // 5. Update null values
    "UPDATE guides SET status = 'pending' WHERE status IS NULL;",
  ];

  for (const query of queries) {
    try {
      console.log(`📝 Executing: ${query}`);
      const { error } = await supabase.rpc("exec_sql", { sql: query });

      if (error) {
        console.error(`❌ Error executing query: ${query}`);
        console.error(`Details: ${error.message}`);
        // Continue anyway as some might fail if already exists (though IF NOT EXISTS handles some)
      } else {
        console.log("✅ Success");
      }
    } catch (err: any) {
      console.error(`❌ Exception: ${err.message}`);
    }
  }

  console.log("🏁 Migration completed.");
}

applyStatusMigration();

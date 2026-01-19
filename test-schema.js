// Test Supabase Tables Schema
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("🔍 Checking Supabase Table Schemas...\n");

  const tables = [
    "users",
    "guides",
    "bookings",
    "transport_bookings",
    "nid_verifications",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists`);
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(", ")}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log("\n📊 Schema check completed!");
}

checkSchema();

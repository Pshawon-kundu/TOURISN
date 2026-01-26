import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStayBookings() {
  console.log("🔍 Checking 'stay_bookings' table...");

  // 1. Check if we can read
  const { data, error, count } = await supabase
    .from("stay_bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error reading table:", error.message);
    return;
  }

  console.log(`✅ Table exists. Total records: ${count}`);
  console.log("📝 Latest 5 records:");
  console.log(JSON.stringify(data, null, 2));
}

checkStayBookings();

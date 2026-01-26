import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // We can't easily DESCRIBE table via JS client without SQL function,
  // but we can try to inserting a dummy record with all possible properties
  // or reading a record and keys.

  console.log("Checking 'bookings' table structure via sample data...");
  const { data, error } = await supabase.from("bookings").select("*").limit(1);

  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("Existing columns:", Object.keys(data[0]));
  } else {
    console.log("Table allows connection but has no data to infer columns.");
  }

  console.log("Checking 'stay_bookings' table structure via sample data...");
  const { data: d2, error: e2 } = await supabase
    .from("stay_bookings")
    .select("*")
    .limit(1);

  if (e2) {
    console.error("Error:", e2);
  } else if (d2 && d2.length > 0) {
    console.log("Existing columns:", Object.keys(d2[0]));
  }
}

checkSchema();

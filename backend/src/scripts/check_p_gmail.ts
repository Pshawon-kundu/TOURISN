import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Force strict path to backend .env
const envPath = path.resolve(__dirname, "../../.env");
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

const supabaseUrl =
  process.env.SUPABASE_URL || "https://evsogczcljdxvqvlbefi.supabase.co";
// Use SERVICE ROLE KEY to bypass RLS
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

console.log(`URL: ${supabaseUrl}`);
console.log(`Key length: ${supabaseKey?.length}`);

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = "p@gmail.com";
  console.log(`Checking for user: ${email}`);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (error) {
    console.error("Error fetching user:", error);
    return;
  }

  if (data && data.length > 0) {
    console.log("User found:", data[0]);
  } else {
    console.log("User NOT found. Fetching a sample user to check schema...");
    const { data: sampleUsers } = await supabase
      .from("users")
      .select("*")
      .limit(1);
    if (sampleUsers && sampleUsers.length > 0) {
      console.log("Sample user:", sampleUsers[0]);
    } else {
      console.log("No users in DB to check schema.");
    }
  }
}

checkUser();

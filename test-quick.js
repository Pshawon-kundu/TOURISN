// Quick Test - Admin Panel Access with Service Role
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://evsogczcljdxvqvlbefi.supabase.co";
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function quickTest() {
  console.log("Testing with service role key (same as admin panel now)...\n");

  const { data, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.log("❌ Error:", error.message);
    return;
  }

  console.log(`✅ SUCCESS! Found ${data.length} users:\n`);
  data.forEach((user, i) => {
    console.log(
      `${i + 1}. ${user.email} - ${user.first_name} ${user.last_name} (${user.role})`,
    );
  });

  console.log("\n✅ Admin panel should now display users!");
  console.log("Refresh: http://localhost:4173 → Users");
}

quickTest();

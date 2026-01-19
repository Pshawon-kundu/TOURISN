// Test Admin Panel Supabase Access
const { createClient } = require("@supabase/supabase-js");

// Use the same config as admin panel
const supabaseUrl = "https://evsogczcljdxvqvlbefi.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4";

console.log("🔍 Testing Admin Panel Supabase Access\n");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUsersQuery() {
  console.log("1️⃣ Testing users table query with ANON key...");
  console.log("   (This is what admin panel uses)\n");

  try {
    const { data, error, status, statusText } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.log("   ❌ ERROR:", error.message);
      console.log("   Code:", error.code);
      console.log("   Details:", error.details);
      console.log("   Hint:", error.hint);
      console.log("   Status:", status);

      if (error.code === "PGRST301" || error.message.includes("RLS")) {
        console.log(
          "\n   🔐 ISSUE: Row Level Security (RLS) is blocking access",
        );
        console.log(
          "   SOLUTION: Need to disable RLS or add policy for anon access\n",
        );
      }

      return false;
    }

    if (!data || data.length === 0) {
      console.log("   ⚠️  Query succeeded but returned 0 rows");
      console.log("   This could be RLS filtering or empty table\n");
      return false;
    }

    console.log(`   ✅ SUCCESS! Found ${data.length} users`);
    console.log("   Sample user:", data[0].email);
    console.log("\n   Admin panel SHOULD be able to see users!\n");
    return true;
  } catch (err) {
    console.log("   ❌ Exception:", err.message);
    return false;
  }
}

async function testWithServiceRole() {
  console.log("2️⃣ Testing with SERVICE ROLE key...");
  console.log("   (Bypasses RLS policies)\n");

  const serviceRoleKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("count")
      .limit(1)
      .single();

    if (error) {
      // Try without single()
      const { data: countData, error: countError } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.log("   ❌ Service role also failed:", countError.message);
        return;
      }
    }

    const { count } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    console.log(`   ✅ Service role can access: ${count} total users\n`);
  } catch (err) {
    console.log("   ❌ Exception:", err.message);
  }
}

async function checkRLSStatus() {
  console.log("3️⃣ Checking RLS (Row Level Security) status...\n");

  const serviceRoleKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabaseAdmin
    .rpc("get_table_rls_status", {
      schema_name: "public",
      table_name: "users",
    })
    .catch(() => null);

  console.log("   Note: RLS status check may not be available");
  console.log("   Check Supabase dashboard → Authentication → Policies\n");
}

async function provideSolution() {
  console.log("========================================");
  console.log("🔧 SOLUTION");
  console.log("========================================\n");

  console.log("The admin panel cannot see users because of RLS policies.\n");
  console.log("FIX OPTIONS:\n");

  console.log("OPTION 1: Disable RLS on users table (QUICK FIX)");
  console.log("SQL Command:");
  console.log("   ALTER TABLE users DISABLE ROW LEVEL SECURITY;\n");

  console.log("OPTION 2: Add policy for anon access (RECOMMENDED)");
  console.log("SQL Command:");
  console.log('   CREATE POLICY "Allow anon to read users"');
  console.log("   ON users FOR SELECT");
  console.log("   TO anon");
  console.log("   USING (true);\n");

  console.log("OPTION 3: Update admin panel to use service role key");
  console.log("   Change admin-web/.env:");
  console.log("   VITE_SUPABASE_KEY=<service_role_key>\n");

  console.log("========================================");
  console.log("RECOMMENDED: Run OPTION 1 or 2 in Supabase SQL Editor");
  console.log("========================================\n");
}

async function runDiagnostics() {
  console.log("========================================");
  console.log("ADMIN PANEL USERS ACCESS DIAGNOSTICS");
  console.log("========================================\n");

  const anonWorks = await testUsersQuery();
  await testWithServiceRole();
  await checkRLSStatus();

  if (!anonWorks) {
    await provideSolution();
  } else {
    console.log("========================================");
    console.log("✅ USERS TABLE IS ACCESSIBLE!");
    console.log("========================================\n");
    console.log("If admin panel still shows no users:");
    console.log("1. Check browser console for errors (F12)");
    console.log("2. Hard refresh the page (Ctrl+Shift+R)");
    console.log("3. Check network tab in dev tools\n");
  }
}

runDiagnostics();

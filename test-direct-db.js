// Simple Direct Database Test
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key

console.log("🔍 Direct Database Access Test\n");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectInsert() {
  const testUser = {
    id: require("uuid").v4(),
    email: `direct_test_${Date.now()}@example.com`,
    first_name: "Direct",
    last_name: "Test",
    role: "user",
    phone: "01712345678",
    avatar_url: null,
    bio: null,
    firebase_uid: null,
  };

  console.log("\n1️⃣ Inserting test user directly...");
  console.log("   Data:", JSON.stringify(testUser, null, 2));

  const { data, error } = await supabase
    .from("users")
    .insert([testUser])
    .select();

  if (error) {
    console.log("   ❌ Insert failed:", error.message);
    console.log("   Details:", error.details);
    console.log("   Hint:", error.hint);
    return false;
  }

  console.log("   ✅ User inserted successfully!");
  console.log("   Result:", data);

  // Verify it's there
  console.log("\n2️⃣ Verifying user exists...");
  const { data: users, error: queryError } = await supabase
    .from("users")
    .select("*")
    .eq("email", testUser.email);

  if (queryError) {
    console.log("   ❌ Query failed:", queryError.message);
    return false;
  }

  if (users && users.length > 0) {
    console.log("   ✅ User found!", users[0]);
    return true;
  } else {
    console.log("   ❌ User not found after insert");
    return false;
  }
}

async function listAllUsers() {
  console.log("\n3️⃣ Listing all users in database...");

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("   ❌ Query failed:", error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log("   ℹ️  No users in database");
  } else {
    console.log(`   ✅ Found ${users.length} user(s):`);
    users.forEach((user, i) => {
      console.log(
        `   ${i + 1}. ${user.email} - ${user.first_name} ${user.last_name} (${user.role})`,
      );
    });
  }
}

async function run() {
  console.log("========================================");
  await testDirectInsert();
  await listAllUsers();
  console.log("========================================\n");
  console.log("✅ Test complete!");
  console.log("Open admin panel to see users: http://localhost:4173");
  console.log("========================================\n");
}

run();

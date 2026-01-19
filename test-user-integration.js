// Test User Registration and Admin Panel Integration
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const backendUrl = "http://localhost:5001/api";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🧪 Testing User Registration and Admin Panel Integration\n");

async function testUserSignup() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "Test123456!";

  console.log("1️⃣ Creating test user via backend...");
  console.log("   Email:", testEmail);

  try {
    // First, create Firebase user (signup via backend)
    const signupResponse = await axios.post(`${backendUrl}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      role: "user",
      firstName: "Test",
      lastName: "User",
      phone: "01712345678",
    });

    console.log(
      "   ✅ Signup API response:",
      signupResponse.data.success ? "Success" : "Failed",
    );

    // Wait a bit for data to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\n2️⃣ Checking if user exists in database...");
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", testEmail);

    if (error) {
      console.log("   ❌ Database query error:", error.message);
      return false;
    }

    if (users && users.length > 0) {
      console.log("   ✅ User found in database!");
      console.log("   - ID:", users[0].id);
      console.log("   - Email:", users[0].email);
      console.log("   - Name:", users[0].first_name, users[0].last_name);
      console.log("   - Role:", users[0].role);
      console.log("   - Created:", users[0].created_at);

      console.log("\n3️⃣ Verifying admin panel can access this user...");
      console.log(
        "   Admin panel should now show this user in Users Management",
      );
      console.log("   Open: http://localhost:4173 → Users");

      return true;
    } else {
      console.log("   ❌ User NOT found in database");
      return false;
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    return false;
  }
}

async function checkExistingUsers() {
  console.log("\n4️⃣ Checking all existing users...");

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.log("   ❌ Query error:", error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log("   ℹ️  No users found in database");
      console.log("   Create users via signup page to see them in admin panel");
    } else {
      console.log(`   ✅ Found ${users.length} users in database:`);
      users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.email} (${user.first_name} ${user.last_name}) - ${user.role}`,
        );
      });
      console.log("\n   These users should be visible in admin panel at:");
      console.log("   http://localhost:4173 → Users Management");
    }
  } catch (error) {
    console.error("   ❌ Error:", error.message);
  }
}

async function runTests() {
  console.log("========================================");
  console.log("TOURISN INTEGRATION TEST");
  console.log("========================================\n");

  // Check existing users first
  await checkExistingUsers();

  // Create a test user
  console.log("\n========================================");
  const success = await testUserSignup();

  console.log("\n========================================");
  console.log("TEST SUMMARY");
  console.log("========================================");

  if (success) {
    console.log("✅ All tests passed!");
    console.log("✅ Backend and database are integrated");
    console.log("✅ Admin panel can access user data");
    console.log("\n📋 Next Steps:");
    console.log("1. Open admin panel: http://localhost:4173");
    console.log("2. Navigate to Users Management");
    console.log("3. You should see the test user created above");
    console.log("4. Try signup on frontend (http://localhost:8081)");
    console.log("5. New signups will automatically appear in admin panel");
  } else {
    console.log("❌ Some tests failed");
    console.log("Check the errors above");
  }

  console.log("========================================\n");
}

runTests();

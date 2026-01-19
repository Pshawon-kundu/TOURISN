// Test Supabase Connection
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("🔍 Testing Supabase Connection...\n");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey ? "Present ✓" : "Missing ✗");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("\n📊 Testing database query...");

    // Test 1: Query users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, role")
      .limit(5);

    if (usersError) {
      console.log("❌ Users query error:", usersError.message);
    } else {
      console.log(`✅ Users table: ${users.length} records found`);
      if (users.length > 0) {
        console.log("   Sample:", users[0].email);
      }
    }

    // Test 2: Query guides table
    const { data: guides, error: guidesError } = await supabase
      .from("guides")
      .select("id, user_id")
      .limit(5);

    if (guidesError) {
      console.log("❌ Guides query error:", guidesError.message);
    } else {
      console.log(`✅ Guides table: ${guides.length} records found`);
    }

    // Test 3: Query bookings table
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, status")
      .limit(5);

    if (bookingsError) {
      console.log("❌ Bookings query error:", bookingsError.message);
    } else {
      console.log(`✅ Bookings table: ${bookings.length} records found`);
    }

    // Test 4: Query transport_bookings table
    const { data: transport, error: transportError } = await supabase
      .from("transport_bookings")
      .select("id, status")
      .limit(5);

    if (transportError) {
      console.log("❌ Transport bookings query error:", transportError.message);
    } else {
      console.log(
        `✅ Transport bookings table: ${transport.length} records found`,
      );
    }

    console.log("\n✅ Supabase connection test completed!");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
  }
}

testConnection();

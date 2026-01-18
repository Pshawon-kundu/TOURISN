// Test Supabase connection from the app
import { supabase } from "./lib/supabase";

async function testConnection() {
  console.log("🧪 Testing Supabase connection...");

  try {
    // Test 1: Check if client is initialized
    if (!supabase) {
      console.error("❌ Supabase client is null");
      return;
    }
    console.log("✅ Supabase client initialized");

    // Test 2: Try to query guides table
    const { data, error, count } = await supabase
      .from("guides")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Error querying guides table:", error);
      return;
    }

    console.log("✅ Successfully connected to Supabase");
    console.log(`   Guides table has ${count} records`);

    // Test 3: Try inserting test data (will be rolled back)
    const testData = {
      first_name: "Test",
      last_name: "Guide",
      email: "test@example.com",
      phone: "+8801234567890",
      nid_number: "1234567890",
      age: 25,
      date_of_birth: "1999-01-01",
      expertise_area: "Tourism",
      specialties: ["Cultural Tours"],
      coverage_areas: ["Dhaka"],
      per_hour_rate: 100,
      years_of_experience: 3,
      bio: "Test bio",
      languages: ["Bengali", "English"],
      certifications: [],
      is_verified: false,
      is_active: true,
      rating: 0,
      total_bookings: 0,
    };

    console.log("🧪 Testing insert (will clean up)...");
    const { data: insertData, error: insertError } = await supabase
      .from("guides")
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insert test failed:", insertError);
      return;
    }

    console.log("✅ Insert test passed");

    // Cleanup: Delete test record
    if (insertData && insertData.id) {
      await supabase.from("guides").delete().eq("id", insertData.id);
      console.log("✅ Test cleanup complete");
    }

    console.log("\n🎉 All tests passed! Supabase is working correctly.");
  } catch (error) {
    console.error("❌ Test failed with exception:", error);
  }
}

testConnection();

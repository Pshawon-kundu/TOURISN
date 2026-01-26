// Create test users for chat testing
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://evsogczcljdxvqvlbefi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDYzODQsImV4cCI6MjA4MzEyMjM4NH0.Rv0P3Mtz5GpHH4UsUP2X2dX9pYM5HzNtgQ2HDn8hxY4",
);

async function createTestUsers() {
  console.log("🔄 Creating test users...\n");

  try {
    // 1. Create Guide User in Auth
    console.log("1️⃣ Creating guide auth user...");
    const { data: guideAuth, error: guideAuthError } =
      await supabase.auth.signUp({
        email: "chakmu@guide.com",
        password: "password123",
      });

    if (guideAuthError) {
      console.error("❌ Guide auth error:", guideAuthError.message);
      return;
    }
    console.log("✅ Guide auth created:", guideAuth.user.id);

    // 2. Create Traveler User in Auth
    console.log("\n2️⃣ Creating traveler auth user...");
    const { data: travelerAuth, error: travelerAuthError } =
      await supabase.auth.signUp({
        email: "traveler@gmail.com",
        password: "password123",
      });

    if (travelerAuthError) {
      console.error("❌ Traveler auth error:", travelerAuthError.message);
      return;
    }
    console.log("✅ Traveler auth created:", travelerAuth.user.id);

    // 3. Insert Guide into users table
    console.log("\n3️⃣ Creating guide profile...");
    const { data: guideProfile, error: guideProfileError } = await supabase
      .from("users")
      .insert({
        id: guideAuth.user.id,
        email: "chakmu@guide.com",
        username: "chakmu",
        first_name: "Chakmu",
        last_name: "Guide",
        role: "guide",
        nid: "1592824588424",
        phone: "+8801234567890",
      })
      .select()
      .single();

    if (guideProfileError) {
      console.error("❌ Guide profile error:", guideProfileError.message);
      return;
    }
    console.log("✅ Guide profile created:", guideProfile);

    // 4. Insert Traveler into users table
    console.log("\n4️⃣ Creating traveler profile...");
    const { data: travelerProfile, error: travelerProfileError } =
      await supabase
        .from("users")
        .insert({
          id: travelerAuth.user.id,
          email: "traveler@test.com",
          username: "traveler1",
          first_name: "Test",
          last_name: "Traveler",
          role: "traveler",
          phone: "+8801987654321",
        })
        .select()
        .single();

    if (travelerProfileError) {
      console.error("❌ Traveler profile error:", travelerProfileError.message);
      return;
    }
    console.log("✅ Traveler profile created:", travelerProfile);

    console.log("\n✅ ✅ ✅ ALL USERS CREATED SUCCESSFULLY! ✅ ✅ ✅");
    console.log("\n📋 Login Credentials:");
    console.log("\n🧑‍💼 Guide (Web):");
    console.log("   NID: 1592824588424");
    console.log("   Phone: +8801234567890");
    console.log("   OR");
    console.log("   Email: chakmu@guide.com");
    console.log("   Password: password123");

    console.log("\n📱 Traveler (Mobile):");
    console.log("   Email: traveler@gmail.com");
    console.log("   Password: password123");
  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
  }
}

createTestUsers();

// Simple script to create test users via the backend API
const axios = require("axios");

const API_URL = "http://localhost:5001/api";

async function createTestUsers() {
  console.log("🔄 Creating test users via API...\n");

  try {
    // 1. Create Traveler
    console.log("1️⃣ Creating traveler...");
    const travelerResponse = await axios.post(`${API_URL}/auth/signup`, {
      email: "traveler@gmail.com",
      password: "password123",
      firstName: "Test",
      lastName: "Traveler",
      phone: "+8801987654321",
      role: "user",
    });
    console.log("✅ Traveler created:", travelerResponse.data);

    // 2. Create Guide
    console.log("\n2️⃣ Creating guide...");
    const guideResponse = await axios.post(`${API_URL}/auth/signup`, {
      email: "chakmu@gmail.com",
      password: "password123",
      firstName: "Chakmu",
      lastName: "Guide",
      phone: "+8801234567890",
      role: "guide",
    });
    console.log("✅ Guide created:", guideResponse.data);

    console.log("\n✅ ✅ ✅ ALL USERS CREATED! ✅ ✅ ✅");
    console.log("\n📋 Login Credentials:");
    console.log("\n🧑‍💼 Guide (Web - localhost:5173):");
    console.log("   Email: chakmu@gmail.com");
    console.log("   Password: password123");

    console.log("\n📱 Traveler (Mobile - Expo):");
    console.log("   Email: traveler@gmail.com");
    console.log("   Password: password123");

    console.log("\n📝 Next Steps:");
    console.log("1. Login as traveler on mobile app");
    console.log('2. Go to "Guides" tab');
    console.log('3. Hire the guide "Chakmu"');
    console.log("4. Open chat with the guide");
    console.log("5. Send a message");
    console.log("6. Login as guide on web (localhost:5173)");
    console.log("7. Go to Messages tab");
    console.log("8. See and reply to the message!");
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
  }
}

createTestUsers();

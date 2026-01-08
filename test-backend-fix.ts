import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

async function testBackendSignup() {
  try {
    console.log("🧪 Testing Backend Signup Endpoint...");

    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      role: "user",
      firebaseUid: "TEST_FIREBASE_UID_" + Date.now(), // Simulating Firebase UID
      firstName: "Test",
      lastName: "Backend",
      phone: "1234567890",
    };

    console.log("Payload:", JSON.stringify(testUser, null, 2));

    const response = await axios.post(`${API_BASE_URL}/auth/signup`, testUser);

    console.log("\n✅ Signup Response:", response.data);
  } catch (error: any) {
    console.error(
      "\n❌ Signup Request Failed:",
      error.response?.data || error.message
    );
  }
}

testBackendSignup();

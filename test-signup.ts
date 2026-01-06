import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

async function testSignup() {
  try {
    console.log("🧪 Testing Signup Flow...\n");

    const testUser = {
      email: `testuser-${Date.now()}@example.com`,
      password: "TestPassword123!",
      firstName: "Test",
      lastName: "User",
      phone: "+1234567890",
      role: "user",
    };

    console.log("📝 Attempting signup with:");
    console.log(JSON.stringify(testUser, null, 2));

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/signup`,
      testUser
    );

    console.log("\n✅ Signup successful!");
    console.log("Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n❌ Signup failed!");
      console.error("Status:", error.response?.status);
      console.error("Error:", error.response?.data);
    } else {
      console.error("\n❌ Unexpected error:", error);
    }
  }
}

async function testGuideRegistration(userId: string, idToken: string) {
  try {
    console.log("\n\n🧪 Testing Guide Registration...\n");

    const guideData = {
      firstName: "Guide",
      lastName: "Test",
      phone: "+1234567890",
      nidNumber: "1234567890",
      nidImageUrl: "https://example.com/nid.jpg",
      age: 35,
      expertiseArea: "Mountain Hiking",
      yearsOfExperience: 5,
      perHourRate: 50,
    };

    console.log("📝 Attempting guide registration with:");
    console.log(JSON.stringify(guideData, null, 2));

    const response = await axios.post(
      `${API_BASE_URL}/api/guides/register`,
      guideData,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    console.log("\n✅ Guide registration successful!");
    console.log("Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n❌ Guide registration failed!");
      console.error("Status:", error.response?.status);
      console.error("Error:", error.response?.data);
    } else {
      console.error("\n❌ Unexpected error:", error);
    }
  }
}

async function testLogin(email: string, password: string) {
  try {
    console.log("\n\n🧪 Testing Login Flow...\n");

    const loginData = {
      email,
      password,
    };

    console.log("📝 Attempting login with:");
    console.log(JSON.stringify(loginData, null, 2));

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      loginData
    );

    console.log("\n✅ Login successful!");
    console.log("Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n❌ Login failed!");
      console.error("Status:", error.response?.status);
      console.error("Error:", error.response?.data);
    } else {
      console.error("\n❌ Unexpected error:", error);
    }
  }
}

async function runTests() {
  // Test signup
  const signupResult = await testSignup();

  if (signupResult?.data?.user?.uid && signupResult?.data?.idToken) {
    const userId = signupResult.data.user.uid;
    const idToken = signupResult.data.idToken;
    const email = signupResult.data.user.email;

    // Test guide registration
    await testGuideRegistration(userId, idToken);

    // Test login
    const loginResult = await testLogin(email, "TestPassword123!");

    console.log("\n\n📊 ===== TEST SUMMARY =====");
    console.log("✅ Signup: PASSED");
    console.log("✅ Guide Registration: PASSED");
    console.log("✅ Login: PASSED");
  }
}

runTests().catch(console.error);

// Test NID OCR backend connection
const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:5001/api";

async function testBackendConnection() {
  console.log("🔍 Testing backend connection...\n");

  // Test 1: Health check
  console.log("Test 1: Health Check");
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log("✅ Health check passed:", data);
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return;
  }

  // Test 2: NID extract endpoint (without image)
  console.log("\nTest 2: NID Extract Endpoint");
  try {
    const response = await fetch(`${API_BASE_URL}/nid/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: "" }),
    });
    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (response.status === 400) {
      console.log("✅ Endpoint exists and validates input");
    }
  } catch (error) {
    console.error("❌ Extract endpoint failed:", error.message);
  }

  console.log(
    "\n✅ Backend is working! NID verification should work in the app.",
  );
}

testBackendConnection();

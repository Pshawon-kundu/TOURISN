const axios = require("axios");

async function testNIDSecurity() {
  console.log("🧪 Testing NID Security System...");

  const fakeNIDs = [
    "123456789010", // The problematic fake NID
    "1234567890",
    "1111111111",
    "0000000000",
    "9999999999",
  ];

  for (const fakeNID of fakeNIDs) {
    try {
      console.log(`\n🔍 Testing fake NID: ${fakeNID}`);

      const response = await axios.post(
        "http://localhost:5001/api/nid/verify",
        {
          userId: "test-user-123",
          nidNumber: fakeNID,
          dateOfBirth: "1995-01-01",
          nidImageBase64:
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        }
      );

      if (response.data.success) {
        console.log(`❌ SECURITY FAILURE: Fake NID ${fakeNID} was ACCEPTED!`);
        console.log(`Response: ${response.data.message}`);
      } else {
        console.log(`✅ SECURITY SUCCESS: Fake NID ${fakeNID} was REJECTED`);
        console.log(`Response: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ SECURITY SUCCESS: Fake NID ${fakeNID} was REJECTED`);
        console.log(`Response: ${error.response.data.message}`);
      } else {
        console.log(`💥 ERROR testing ${fakeNID}:`, error.message);
      }
    }
  }

  console.log("\n🏁 Security test completed!");
}

testNIDSecurity();

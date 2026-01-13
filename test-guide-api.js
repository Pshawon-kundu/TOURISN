// Test Guide Registration API
const testData = {
  email: `testguide${Date.now()}@test.com`,
  password: "test123456",
  firstName: "John",
  lastName: "Doe",
  phone: "+8801700000000",
  bio: "Expert in cultural tours with 5 years of experience",
  specialties: "Cultural Tours",
  languages: "English",
  yearsOfExperience: 5,
  certifications: "",
  nidNumber: "1234567890123",
  nidImageUrl: "",
  city: "Dhaka",
  district: "Dhaka",
  perHourRate: 500,
};

console.log("Testing Guide Registration API...");
console.log("Endpoint: http://localhost:5001/api/guides/signup");
console.log("Test Data:", JSON.stringify(testData, null, 2));

fetch("http://localhost:5001/api/guides/signup", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => {
    console.log("\n✅ Response Status:", response.status);
    return response.json();
  })
  .then((data) => {
    console.log("\n✅ Response Data:");
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n🎉 SUCCESS! Guide registered successfully!");
      console.log("User ID:", data.data.user.id);
      console.log("Guide ID:", data.data.guide.id);
      console.log("\n✅ Check your Supabase tables:");
      console.log("- users table for user record");
      console.log("- guides table for guide profile");
      console.log("- guide_verifications table for NID verification");
    } else {
      console.log("\n❌ ERROR:", data.error);
    }
  })
  .catch((error) => {
    console.error("\n❌ Request Failed:", error.message);
    console.log("\nTroubleshooting:");
    console.log(
      "1. Is backend running? Check: http://localhost:5001/api/health"
    );
    console.log("2. Check backend console for errors");
  });

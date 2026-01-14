// Test the enhanced guide registration API
const testGuideRegistration = async () => {
  const testData = {
    firstName: "Ahmed",
    lastName: "Rahman",
    email: "ahmed.rahman@example.com",
    phone: "+8801712345678",
    profileImage: "https://example.com/profile.jpg",
    bio: "Experienced local guide with 5 years of experience in Bangladesh tourism",
    specialties: ["Cultural Tours", "Historical Sites"],
    languages: ["Bengali", "English", "Hindi"],
    yearsOfExperience: 5,
    certifications: ["Certified Tour Guide", "First Aid Certified"],
    nidNumber: "1234567890123",
    nidImageUrl: "https://example.com/nid.jpg",
    age: 30,
    expertiseArea: "Dhaka Cultural Tours",
    perHourRate: 500,
    selectedExpertiseCategories: [
      "Historical Sites",
      "Cultural Tours",
      "Local Food",
    ],
    coverageAreas: ["Dhaka", "Gazipur", "Narayanganj", "Manikganj"],
    dateOfBirth: "15/05/1994",
  };

  try {
    console.log("🔄 Testing enhanced guide registration...");

    const response = await fetch("http://localhost:5001/api/guides/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log("✅ Guide registration successful!");
      console.log("📋 Response:", JSON.stringify(result, null, 2));
    } else {
      console.log("❌ Guide registration failed:");
      console.log("📋 Error:", result.error || "Unknown error");
      console.log("📋 Full response:", JSON.stringify(result, null, 2));

      if (result.error && result.error.includes("column")) {
        console.log("\n💡 Database schema issue detected.");
        console.log("Please run the database migration:");
        console.log("1. Open Supabase SQL Editor");
        console.log(
          "2. Run the SQL from: backend/migrations/007_add_expertise_and_coverage_fields.sql"
        );
      }
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
    console.log(
      "💡 Make sure the backend server is running on http://localhost:5001"
    );
  }
};

// Test getting guides to see the current data format
const testGetGuides = async () => {
  try {
    console.log("\n🔄 Testing get guides API...");

    const response = await fetch("http://localhost:5001/api/guides");
    const result = await response.json();

    if (response.ok && result.success) {
      console.log("✅ Get guides successful!");
      console.log("📊 Total guides:", result.data.length);

      if (result.data.length > 0) {
        const sample = result.data[0];
        console.log("📋 Sample guide data structure:");
        console.log(JSON.stringify(sample, null, 2));

        // Check if new fields are present
        if (
          sample.expertiseCategories !== undefined &&
          sample.coverageAreas !== undefined
        ) {
          console.log(
            "✅ New fields (expertiseCategories, coverageAreas) are present!"
          );
        } else {
          console.log("⚠️  New fields are missing - database migration needed");
        }
      }
    } else {
      console.log("❌ Get guides failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
};

// Run tests
console.log("🚀 Starting Enhanced Guide Registration Tests");
console.log("=".repeat(50));

testGuideRegistration()
  .then(() => {
    return testGetGuides();
  })
  .then(() => {
    console.log("\n🎉 Tests completed!");
  });

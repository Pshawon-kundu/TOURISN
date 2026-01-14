// Test guide registration with mock authentication
const testWithMockAuth = async () => {
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
    console.log("🔄 Testing guide registration with mock auth...");

    const response = await fetch("http://localhost:5001/api/guides/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token-for-testing",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log("📋 Response status:", response.status);
    console.log("📋 Response body:", JSON.stringify(result, null, 2));

    if (result.error && result.error.includes("column")) {
      console.log("\n💡 Database migration needed! Run this SQL in Supabase:");
      console.log(`
-- Add expertise categories and coverage areas to guides table
ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS expertise_categories JSONB DEFAULT '[]'::jsonb;

ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS coverage_areas JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN guides.expertise_categories IS 'Guide expertise categories as JSON array';
COMMENT ON COLUMN guides.coverage_areas IS 'Districts/areas the guide can cover as JSON array';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guides_expertise_categories ON guides USING GIN (expertise_categories);
CREATE INDEX IF NOT EXISTS idx_guides_coverage_areas ON guides USING GIN (coverage_areas);
      `);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
};

testWithMockAuth();

const testData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+8801712345678",
  profileImage: "https://example.com/profile.jpg",
  bio: "Experienced local guide with 5 years of experience",
  specialties: ["City Tours", "Cultural Sites"],
  languages: ["Bengali", "English"],
  yearsOfExperience: 5,
  certifications: ["Certified Tour Guide"],
  nidNumber: "1234567890123",
  nidImageUrl: "https://example.com/nid.jpg",
  age: 30,
  expertiseArea: "Dhaka",
  perHourRate: 500,
  selectedExpertiseCategories: [
    "Historical Sites",
    "Cultural Tours",
    "Local Food",
  ],
  coverageAreas: ["Dhaka", "Gazipur", "Narayanganj"],
};

// Test the enhanced guide registration
fetch("http://localhost:5001/api/guides/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // Add auth token when available
  },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Guide registration response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

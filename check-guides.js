const fetch = require("node-fetch");

async function checkGuides() {
  try {
    const response = await fetch("http://localhost:5001/api/guides?limit=100");
    const data = await response.json();

    if (data.success) {
      console.log(`Found ${data.data.length} guides.`);
      data.data.forEach((g) => {
        console.log(
          `[${g.rating}] ${g.name} (${g.email}) - Photo: ${g.photo.substring(0, 50)}...`,
        );
      });

      // Check for non-script guides
      const userGuides = data.data.filter(
        (g) => !g.email.includes("tourisn.com"),
      );
      console.log("\n--- User Manual Guides? ---");
      if (userGuides.length > 0) {
        userGuides.forEach((g) => console.log(JSON.stringify(g, null, 2)));
      } else {
        console.log('No guides found with email not containing "tourisn.com"');
      }
    } else {
      console.log("Failed:", data.error);
    }
  } catch (e) {
    console.error(e);
  }
}

checkGuides();

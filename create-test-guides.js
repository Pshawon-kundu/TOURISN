const { createClient } = require("@supabase/supabase-js");

// Configuration from existing files
const supabaseUrl = "https://evsogczcljdxvqvlbefi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c29nY3pjbGpkeHZxdmxiZWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0NjM4NCwiZXhwIjoyMDgzMTIyMzg0fQ.Vm0heVlZFqbTVunbtZ4vh4prxawyijSpfebXd_F53g0";

const supabase = createClient(supabaseUrl, supabaseKey);

const DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Rangpur",
  "Barisal",
  "Mymensingh",
];

const CATEGORIES = ["Beach", "Hills", "City", "Culture", "Food"];

// Sample names database to mix and match
const FIRST_NAMES = [
  "Rahim",
  "Karim",
  "Abdul",
  "Fatima",
  "Ayesha",
  "Kamal",
  "Jamal",
  "Nasrin",
  "Sultana",
  "Rafiq",
  "Jabbar",
  "Salam",
  "Borkot",
  "Mehrab",
  "Tanvir",
  "Saima",
  "Rina",
  "Mina",
  "Tina",
  "Luna",
  "Sohan",
  "Mohan",
  "Rohan",
];

const LAST_NAMES = [
  "Ahmed",
  "Khan",
  "Chowdhury",
  "Rahman",
  "Islam",
  "Hossain",
  "Uddin",
  "Ali",
  "Sarkar",
  "Mia",
  "Begum",
  "Akter",
  "Haque",
  "Talukder",
  "Sikder",
];

const BIO_TEMPLATES = [
  "I am a passionate guide in {div} specializing in {cat}. I love showing people around.",
  "Expert in {cat} tours around {div}. 5 years of experience.",
  "Your local friend in {div}. Let's explore the best {cat} spots together.",
  "Certified guide for {cat} lovers visiting {div}.",
  "I know every corner of {div}. Join me for an amazing {cat} experience.",
];

async function cleanupExistingGuide(email) {
  // 1. Find user by email
  const { data: users } = await supabase
    .from("users")
    .select("id, auth_id")
    .eq("email", email);

  if (users && users.length > 0) {
    for (const user of users) {
      console.log(`Cleaning up existing user: ${email}`);
      // Delete from guides
      await supabase.from("guides").delete().eq("user_id", user.id);
      // Delete from users
      await supabase.from("users").delete().eq("id", user.id);
      // Delete from auth
      if (user.auth_id) {
        await supabase.auth.admin.deleteUser(user.auth_id);
      }
    }
  }
}

async function createGuide(division, category, index) {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  // Predictable email for easier login
  // Format: guide.{division}.{category}{index}@tourisn.com (lowercased)
  const safeDiv = division.toLowerCase();
  const safeCat = category.toLowerCase();
  const email = `guide.${safeDiv}.${safeCat}${index}@tourisn.com`;
  const password = "password123";

  const phone = `+8801${Math.floor(100000000 + Math.random() * 900000000)}`;

  const bio = BIO_TEMPLATES[Math.floor(Math.random() * BIO_TEMPLATES.length)]
    .replace("{div}", division)
    .replace("{cat}", category);

  try {
    await cleanupExistingGuide(email);

    // 1. Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: "guide",
        },
      });

    if (authError) throw authError;

    // 2. Insert into public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: "guide",
      })
      .select()
      .single();

    if (userError) throw userError;

    // 3. Insert into public.guides
    const { error: guideError } = await supabase.from("guides").insert({
      user_id: userData.id,
      bio: bio,
      specialties: [category, "General"], // Legacy support if needed
      expertise_area: `${category} Tours in ${division}`, // Required field
      expertise_categories: [category, "Walking Tour"], // New JSON field
      languages: ["Bangla", "English"],
      years_of_experience: Math.floor(Math.random() * 10) + 1,
      certifications: ["Certified Tourist Guide"],
      age: Math.floor(25 + Math.random() * 20),
      nid_number: Math.floor(
        1000000000 + Math.random() * 9000000000,
      ).toString(),

      nid_image_url: "https://dummyimage.com/600x400/000/fff&text=NID", // Required field
      coverage_areas: [division, `${division} City`, "Surrounding Areas"], // New JSON field
      rating: (4 + Math.random()).toFixed(1),
      total_reviews: Math.floor(Math.random() * 50),
      is_verified: true, // Auto verify
      status: "active", // Valid values: active, pending, suspended, rejected
      // verification_status: REMOVED as column does not exist
      per_hour_rate: 500 + Math.floor(Math.random() * 1000), // Random rate 500-1500
      // profile_image_url: REMOVED as column does not exist
    });

    if (guideError) throw guideError;

    console.log(`✅ Created: ${email} | ${phone} | ${division} | ${category}`);
    return { email, password, phone, division, category };
  } catch (err) {
    console.error(`FAILED to create ${email}:`, err.message);
    return null;
  }
}

async function main() {
  console.log(
    "🚀 Starting Guide Population for 8 Divisions & All Categories...\n",
  );

  const createdGuides = [];

  for (const div of DIVISIONS) {
    console.log(`\n📍 Processing Division: ${div}`);
    for (const cat of CATEGORIES) {
      // Create 1 guide per category/division for now to be fast
      const guide = await createGuide(div, cat, 1);
      if (guide) createdGuides.push(guide);
    }
  }

  console.log("\n\n✨ SUMMARY OF CREATED GUIDES ✨");
  console.log(
    "=================================================================================",
  );
  console.log(
    "| Division   | Category | Email                                      | Password    |",
  );
  console.log(
    "|------------|----------|--------------------------------------------|-------------|",
  );
  createdGuides.forEach((g) => {
    console.log(
      `| ${g.division.padEnd(10)} | ${g.category.padEnd(8)} | ${g.email.padEnd(42)} | ${g.password.padEnd(11)} |`,
    );
  });
  console.log(
    "=================================================================================",
  );

  // Save credentials to a file for the user
  const jsonContent = JSON.stringify(createdGuides, null, 2);
  require("fs").writeFileSync("./created_guides_credentials.json", jsonContent);
  console.log("\n Credentials saved to 'created_guides_credentials.json'");
}

main();

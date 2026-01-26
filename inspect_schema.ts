import { supabase } from "./backend/src/config/supabase";

async function checkSchema() {
  console.log("Checking 'users' table schema...");

  // We can't directly query schema info via supabase-js easily without raw SQL or a specific user having permissions.
  // But we can try to select one row and see the keys.

  const { data, error } = await supabase.from("users").select("*").limit(1);

  if (error) {
    console.error("Error fetching users:", error);
  } else if (data && data.length > 0) {
    console.log("Keys in 'users' table:", Object.keys(data[0]));
    console.log("Sample user:", data[0]);
  } else {
    console.log(
      "No users found to inspect schema. Trying to insert a test user to fail and see error?",
    );
  }
}

checkSchema();

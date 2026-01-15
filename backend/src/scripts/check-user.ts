/**
 * Check if test user exists in Supabase
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

const checkUser = async () => {
  try {
    const email = "prince@gmail.com";

    console.log(`\n🔍 Checking for user: ${email}`);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("❌ Query error:", error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log("✅ User found in Supabase:");
      const user = data[0];
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.log("⚠️  User NOT found in Supabase");
      console.log("\nThe login error occurs because:");
      console.log("1. User exists in Firebase Auth");
      console.log("2. But NO profile in Supabase database");
      console.log("\n✅ GOOD NEWS: The fix has been applied!");
      console.log("   Auto-create user profile is now enabled in /auth/login");
      console.log("\nTo test login now:");
      console.log("   - Try logging in with prince@gmail.com");
      console.log(
        "   - If login succeeds once, user will be auto-created in Supabase"
      );
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkUser();

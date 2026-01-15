/**
 * Setup script - Create test user in both Firebase and Supabase
 * Run: ts-node -P tsconfig.json src/scripts/setup-test-user.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as any),
  });
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

const setupTestUser = async () => {
  try {
    const email = "prince@gmail.com";
    const password = "Prince@123";

    console.log("\n🔧 Setting up test user...");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    // Step 1: Create in Firebase
    console.log("\n📝 Step 1: Firebase Auth");
    let firebaseUid = "";

    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log(`   ✅ User already exists in Firebase: ${existingUser.uid}`);
      firebaseUid = existingUser.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        const newUser = await admin.auth().createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`   ✅ User created in Firebase: ${newUser.uid}`);
        firebaseUid = newUser.uid;
      } else {
        throw error;
      }
    }

    // Step 2: Create in Supabase
    console.log("\n📝 Step 2: Supabase Database");

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      console.log(`   ✅ User already exists in Supabase: ${existingUser.id}`);
    } else if (checkError && checkError.code === "PGRST116") {
      // User doesn't exist, create it
      const userData = {
        id: uuidv4(),
        email,
        role: "traveler",
        first_name: "Prince",
        last_name: "Kundu",
        phone: "+8801700000000",
        avatar_url: null,
        bio: "Test user for tourism app",
        firebase_uid: firebaseUid,
      };

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([userData])
        .select();

      if (insertError) {
        console.error("   ❌ Failed to create user:", insertError);
        throw insertError;
      }

      console.log(`   ✅ User created in Supabase: ${newUser?.[0]?.id}`);
    } else {
      throw checkError;
    }

    console.log("\n✅ Test user setup complete!");
    console.log("\nYou can now login with:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error: any) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }

  process.exit(0);
};

setupTestUser();

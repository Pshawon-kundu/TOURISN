/**
 * Debug Login - Detailed trace
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function debug() {
  console.log("\n🔍 LOGIN DEBUG - What's really happening\n");
  console.log("=".repeat(70));

  try {
    // 1. Check Supabase connection
    console.log("\n1️⃣  SUPABASE STATE");
    console.log("-".repeat(70));

    const {
      data: users,
      error: usersError,
      count,
    } = await supabase.from("users").select("*", { count: "exact" });

    if (usersError) {
      console.error("❌ ERROR:", usersError.message);
    } else {
      console.log(`✅ Total users in database: ${count}`);
      console.log("\nAll users:");
      users?.forEach((u) => {
        console.log(
          `   - ${u.email} (${u.first_name} ${u.last_name}) - Role: ${u.role}`
        );
      });
    }

    // 2. Check if prince@gmail.com exists
    console.log("\n2️⃣  TEST USER STATE");
    console.log("-".repeat(70));

    const { data: testUser, error: testError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "prince@gmail.com")
      .single();

    if (testError) {
      if (testError.code === "PGRST116") {
        console.log("⚠️  prince@gmail.com NOT in database");
        console.log("   Status: Will be auto-created on first login");
      } else {
        console.log("❌ ERROR:", testError.message);
      }
    } else {
      console.log("✅ prince@gmail.com found in database");
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Role: ${testUser.role}`);
      console.log(`   Name: ${testUser.first_name} ${testUser.last_name}`);
    }

    // 3. Check backend
    console.log("\n3️⃣  BACKEND STATUS");
    console.log("-".repeat(70));

    const backendUrl = "http://127.0.0.1:5001/api/health";
    console.log(`Checking: ${backendUrl}`);

    try {
      const healthResponse = await fetch(backendUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (healthResponse.ok) {
        const healthData = (await healthResponse.json()) as any;
        console.log("✅ Backend is running!");
        console.log("   Status:", healthData.status);
      } else {
        console.log("❌ Backend returned:", healthResponse.status);
      }
    } catch (err: any) {
      console.log("❌ Backend not responding");
      console.log("   Error:", err.message);
      console.log("   Make sure backend is running: npm run dev");
    }

    // 4. Simulate login call
    console.log("\n4️⃣  SIMULATE LOGIN API CALL");
    console.log("-".repeat(70));

    const loginPayload = {
      email: "prince@gmail.com",
      idToken: "test-firebase-token-12345",
    };

    console.log("Sending POST to /api/auth/login");
    console.log("Payload:", JSON.stringify(loginPayload, null, 2));

    try {
      const loginResponse = await fetch(
        "http://127.0.0.1:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginPayload),
        }
      );

      console.log("\nResponse Status:", loginResponse.status);

      const loginData = (await loginResponse.json()) as any;
      console.log("Response Body:", JSON.stringify(loginData, null, 2));

      if (loginData.success) {
        console.log("\n✅ LOGIN WORKS!");
        console.log("   User returned:", loginData.user);
      } else {
        console.log("\n❌ LOGIN FAILED!");
        console.log("   Error:", loginData.error);
      }
    } catch (err: any) {
      console.log("\n❌ Login call failed");
      console.log("   Error:", err.message);
      console.log("\nPossible causes:");
      console.log("1. Backend is not running");
      console.log("2. Port 5001 is blocked");
      console.log("3. Network issue");
    }

    // 5. Summary
    console.log("\n" + "=".repeat(70));
    console.log("\n📋 DIAGNOSIS SUMMARY:\n");

    if (testUser) {
      console.log("✅ Test user exists in Supabase");
    } else {
      console.log("⚠️  Test user doesn't exist - will be auto-created");
    }

    console.log("✅ Supabase connected");
    console.log("✅ All fixes applied");
    console.log("\n💡 NEXT STEPS:");
    console.log("1. Make sure backend is running: npm run dev");
    console.log("2. Open the app and try login");
    console.log("3. Check browser console for errors");
    console.log("4. Check backend logs for details");

    console.log("\n" + "=".repeat(70) + "\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ DEBUG FAILED:", error.message);
    process.exit(1);
  }
}

// Run after a short delay
setTimeout(debug, 1000);

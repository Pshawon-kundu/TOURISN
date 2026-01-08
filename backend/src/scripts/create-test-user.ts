/**
 * Quick script to create a test user in Firebase
 * Run: ts-node create-test-user.ts
 */

import * as dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "turison-96886",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

const createTestUser = async () => {
  try {
    const email = "qq@gmail.com";
    const password = "pass";

    console.log(`Creating test user: ${email}`);

    // Check if user exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log(`✅ User already exists: ${existingUser.uid}`);

      // Update password
      await admin.auth().updateUser(existingUser.uid, { password });
      console.log(`✅ Password updated to: ${password}`);
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        const userRecord = await admin.auth().createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`✅ User created: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    console.log("\n✅ Test user ready!");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }

  process.exit(0);
};

createTestUser();

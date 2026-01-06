import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Log Firebase config check
console.log("🔍 Firebase Config Check:");
console.log(
  "  Project ID:",
  process.env.FIREBASE_PROJECT_ID ? "✓ Set" : "❌ Missing"
);
console.log(
  "  Client Email:",
  process.env.FIREBASE_CLIENT_EMAIL ? "✓ Set" : "❌ Missing"
);
console.log(
  "  Private Key:",
  process.env.FIREBASE_PRIVATE_KEY ? "✓ Set" : "❌ Missing"
);

let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error(
    "❌ Firebase Admin SDK initialization FAILED:",
    error instanceof Error ? error.message : error
  );
  console.error("Full error:", error);
  // Don't exit - allow app to run with null Firebase auth
}

// Export Firebase services only if initialized
export const firebaseAuth = firebaseInitialized ? admin.auth() : null;
export const firebaseDB = firebaseInitialized ? admin.firestore() : null;
export const firebaseStorage = firebaseInitialized ? admin.storage() : null;

console.log("📊 Firebase Services Status:");
console.log("  Auth:", firebaseAuth ? "✅ Available" : "❌ Not Available");
console.log("  Firestore:", firebaseDB ? "✅ Available" : "❌ Not Available");
console.log(
  "  Storage:",
  firebaseStorage ? "✅ Available" : "❌ Not Available"
);

export default admin;

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

let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    firebaseInitialized = true;
    console.log("✓ Firebase Admin initialized");
  }
} catch (error) {
  console.warn(
    "⚠ Firebase initialization skipped (optional for dual-database setup):",
    error instanceof Error ? error.message : error
  );
}

// Export Firebase services only if initialized
export const firebaseAuth = firebaseInitialized ? admin.auth() : null;
export const firebaseDB = firebaseInitialized ? admin.firestore() : null;
export const firebaseStorage = firebaseInitialized ? admin.storage() : null;

export default admin;

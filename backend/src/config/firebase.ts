import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

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

// Initialize Firebase only if credentials are properly set
let firebaseAuth: any;
let firebaseDB: any;

if (
  !admin.apps.length &&
  serviceAccount.project_id &&
  serviceAccount.private_key
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseAuth = admin.auth();
    firebaseDB = admin.firestore();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
    console.warn("Firebase features will be disabled");
  }
} else {
  console.warn(
    "Firebase credentials not fully configured. Firebase features will be disabled."
  );
}

export { firebaseAuth, firebaseDB };
export default admin;

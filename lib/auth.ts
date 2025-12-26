import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type Auth,
  type User,
} from "firebase/auth";

import { getAuthInstance, initFirebase } from "./firebase";

let cachedConfig: any | null = null;

async function loadFirebaseConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    // Optional import so the app can run without config while showing a helpful message
    const mod = await import("@/constants/firebaseConfig");
    cachedConfig = (mod as any).firebaseConfig || (mod as any).default || null;
  } catch {
    cachedConfig = null;
  }
  return cachedConfig;
}

async function ensureAuth(): Promise<Auth | null> {
  const existingAuth = getAuthInstance();
  if (existingAuth) return existingAuth;

  const config = await loadFirebaseConfig();
  if (!config) return null;

  initFirebase(config);
  return getAuthInstance();
}

export async function signIn(email: string, password: string) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const idToken = await userCredential.user.getIdToken();

  // Call backend to get user role and validate
  const API_URL = "http://localhost:5001"; // Update to your backend URL
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, idToken }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Login failed");
  }

  // Reject admin users - they should use web dashboard
  if (data.user.role === "admin") {
    await firebaseSignOut(auth);
    throw new Error("Admin users should visit admin.tourisn.com");
  }

  return userCredential;
}

export async function signUp(
  email: string,
  password: string,
  role: "traveler" | "guide" = "traveler",
  name?: string
) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const idToken = await userCredential.user.getIdToken();

  // Register user in backend with role
  const API_URL = "http://localhost:5001"; // Update to your backend URL
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role, name }),
  });

  const data = await response.json();

  if (!data.success) {
    // Delete Firebase user if backend registration fails
    await userCredential.user.delete();
    throw new Error(data.error || "Signup failed");
  }

  return userCredential;
}

export async function signOut() {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");
  return sendPasswordResetEmail(auth, email);
}

export async function watchAuth(
  handler: (user: User | null) => void
): Promise<() => void> {
  const auth = await ensureAuth();
  if (!auth) {
    handler(null);
    return () => {};
  }
  return onAuthStateChanged(auth, handler);
}

export type AuthUser = User | null;

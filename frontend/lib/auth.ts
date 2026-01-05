import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type Auth,
  type User,
} from "firebase/auth";

import { api } from "./api";
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
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");
  return createUserWithEmailAndPassword(auth, email, password);
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
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get Firebase ID token and set it for API requests
      const token = await user.getIdToken();
      api.setToken(token);
    } else {
      // Clear token when user logs out
      api.clearToken();
    }
    handler(user);
  });
}

export type AuthUser = User | null;

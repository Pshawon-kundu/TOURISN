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
  if (existingAuth) {
    console.log("✅ Using existing Auth instance");
    return existingAuth;
  }

  console.log("🔄 Loading Firebase config...");
  const config = await loadFirebaseConfig();
  if (!config) {
    console.error("❌ Firebase config not found");
    return null;
  }

  console.log("🔄 Initializing Firebase...");
  initFirebase(config);

  const auth = getAuthInstance();
  if (auth) {
    console.log("✅ Auth instance ready");
  } else {
    console.error("❌ Failed to get Auth instance after initialization");
  }

  return auth;
}

export async function signIn(email: string, password: string) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");

  try {
    console.log("🔐 Attempting sign in for:", email);

    // 1. Sign in with Firebase first
    console.log("🔥 Authenticating with Firebase...");
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    console.log("✅ Firebase auth successful");

    // Verify user exists in backend database
    console.log("📤 Verifying credentials in backend...");
    const payload = {
      email: email.trim(),
      password: password,
      idToken: idToken,
    };

    console.log(
      "   Payload:",
      JSON.stringify({ email: payload.email, password: "***" })
    );

    const response = await api.post<{
      success: boolean;
      user: { id: string; email: string; role: string };
    }>("/auth/login", payload);

    console.log("✅ Backend verified user exists");
    console.log("   User:", response.user);

    // Store logged-in user email in localStorage for session management
    if (typeof window !== "undefined") {
      localStorage.setItem("userEmail", email.trim());
    }

    console.log("✅ Login complete!");

    return response;
  } catch (error: any) {
    console.error("❌ Sign in failed:", {
      message: error.message,
      errorDetails: error,
    });

    // Throw user-friendly error
    const err = new Error(
      "Invalid email or password. Please check and try again."
    );
    throw err;
  }
}

export async function signUp(
  email: string,
  password: string,
  firstName: string = "",
  lastName: string = "",
  role: string = "user",
  phone: string = ""
) {
  const auth = await ensureAuth();
  if (!auth)
    throw new Error("Firebase config missing. Add constants/firebaseConfig.ts");

  let userCredential: any = null;

  try {
    console.log("📝 Starting signup for:", email);
    console.log("   Name:", `${firstName} ${lastName}`.trim());
    console.log("   Role:", role);

    // Step 1: Create user in Firebase Auth first
    console.log("🔥 Creating Firebase user...");
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("✅ Firebase user created successfully");
    console.log("   UID:", userCredential.user.uid);

    // Step 2: Send to backend to create Supabase user profile
    console.log("📤 Sending signup data to backend...");
    const payload = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim(),
      phone: phone.trim(),
      firebaseUid: userCredential.user.uid,
    };
    console.log("   Payload:", JSON.stringify(payload));

    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        user: { email: string; role: string };
      }>("/auth/signup", payload);

      console.log("✅ Backend created user profile");
      console.log("   Response:", response);
      console.log("✅ Signup complete! You can now login.");

      return response;
    } catch (backendError: any) {
      console.error("❌ Backend signup failed:", backendError);

      // If backend fails, delete the Firebase user we just created
      if (userCredential?.user) {
        console.log("🔄 Cleaning up Firebase user due to backend failure...");
        try {
          await userCredential.user.delete();
          console.log("✅ Firebase user deleted");
        } catch (deleteError) {
          console.error("❌ Failed to delete Firebase user:", deleteError);
        }
      }

      throw backendError;
    }
  } catch (error: any) {
    console.error("❌ Signup failed:", {
      code: error.code,
      message: error.message,
      details: error,
    });

    // Helpful error messages for common scenarios
    if (error.code === "auth/email-already-in-use") {
      const err = new Error(
        "This email is already registered. Please login instead or use a different email."
      );
      (err as any).code = error.code;
      throw err;
    } else if (error.code === "auth/weak-password") {
      const err = new Error(
        "Password is too weak. Please use at least 6 characters."
      );
      (err as any).code = error.code;
      throw err;
    } else if (error.code === "auth/invalid-email") {
      const err = new Error(
        "Invalid email format. Please check and try again."
      );
      (err as any).code = error.code;
      throw err;
    }

    throw error;
  }
}

export async function registerAsGuide(
  firstName: string,
  lastName: string,
  phone: string,
  nidNumber: string,
  nidImageUrl: string,
  age: number,
  expertiseArea: string,
  yearsOfExperience: number,
  perHourRate: number
) {
  // Call backend API to register guide profile
  const response = await api.post("/guides/register", {
    firstName,
    lastName,
    phone,
    nidNumber,
    nidImageUrl,
    age,
    expertiseArea,
    yearsOfExperience,
    perHourRate,
  });
  return response;
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

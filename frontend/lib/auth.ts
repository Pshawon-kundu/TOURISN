import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { api } from "./api";

let cachedClient: SupabaseClient | null = null;
let cachedConfig: any | null = null;

async function loadSupabaseConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const mod = await import("@/constants/supabaseConfig");
    cachedConfig = (mod as any).supabaseConfig || (mod as any).default || null;
  } catch {
    cachedConfig = null;
  }
  return cachedConfig;
}

async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (cachedClient) {
    console.log("✅ Using cached Supabase client");
    return cachedClient;
  }

  console.log("🔄 Loading Supabase config...");
  const config = await loadSupabaseConfig();
  if (!config || !config.supabaseUrl || !config.supabaseKey) {
    console.error(
      "❌ Supabase config missing. Add constants/supabaseConfig.ts"
    );
    return null;
  }

  console.log("🔄 Initializing Supabase...");
  cachedClient = createClient(config.supabaseUrl, config.supabaseKey);

  if (cachedClient) {
    console.log("✅ Supabase client ready");
  } else {
    console.error("❌ Failed to create Supabase client");
  }

  return cachedClient;
}

export async function signIn(email: string, password: string) {
  const supabase = await getSupabaseClient();
  if (!supabase)
    throw new Error("Supabase config missing. Add constants/supabaseConfig.ts");

  try {
    console.log("🔐 Attempting sign in for:", email);
    console.log("🔑 Authenticating with Supabase...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error("❌ Supabase auth error:", {
        message: error.message,
        status: error.status,
      });

      if (error.message.includes("Invalid login credentials")) {
        throw new Error(
          "No account found with this email or password is incorrect. Please check and try again."
        );
      }

      throw new Error(error.message || "Login failed");
    }

    if (!data.user) {
      throw new Error("Login failed: No user returned");
    }

    console.log("✅ Supabase auth successful");
    console.log("   User ID:", data.user.id);
    console.log("   Email:", data.user.email);

    // Notify backend for admin dashboard (login event)
    try {
      console.log("📤 Notifying backend for admin dashboard...");
      const response = await api.post<{
        success: boolean;
        user: { id: string; email: string; role: string };
      }>("/auth/login", {
        email: email.trim(),
        supabaseUserId: data.user.id,
      });

      console.log("✅ Backend notified, admin dashboard updated");

      // Store logged-in user email in localStorage for session management
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", email.trim());
      }

      console.log("✅ Login complete!");

      return response;
    } catch (backendError: any) {
      console.error("⚠️  Backend notification failed:", backendError);
      // Still return success since Supabase auth worked
      // Store logged-in user email in localStorage for session management
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", email.trim());
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || "",
          role: data.user.user_metadata?.role || "traveler",
        },
      };
    }
  } catch (error: any) {
    console.error("❌ Sign in failed:", {
      message: error.message,
      details: error,
    });

    throw new Error(
      error.message || "Invalid email or password. Please check and try again."
    );
  }
}

export async function signUp(
  email: string,
  password: string,
  firstName: string = "",
  lastName: string = "",
  role: string = "traveler",
  phone: string = ""
) {
  const supabase = await getSupabaseClient();
  if (!supabase)
    throw new Error("Supabase config missing. Add constants/supabaseConfig.ts");

  try {
    console.log("📝 Starting signup for:", email);
    console.log("   Name:", `${firstName} ${lastName}`.trim());
    console.log("   Role:", role);

    // Step 1: Create user in Supabase Auth
    console.log("🔑 Creating Supabase Auth user...");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: role.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (signUpError) {
      console.error("❌ Supabase signup error:", signUpError.message);

      if (signUpError.message.includes("already registered")) {
        throw new Error(
          "This email is already registered. Please login instead or use a different email."
        );
      }

      throw new Error(signUpError.message || "Signup failed");
    }

    if (!data.user) {
      throw new Error("Signup failed: No user returned");
    }

    console.log("✅ Supabase Auth user created successfully");
    console.log("   UID:", data.user.id);

    // Step 2: Create user profile in database (if database exists)
    console.log("📤 Creating user profile in database...");

    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: role.trim(),
        phone: phone.trim() || null,
      },
    ]);

    if (profileError) {
      console.error("⚠️  Profile creation error:", profileError.message);
      // Still continue - user is created in auth
    } else {
      console.log("✅ User profile created in database");
    }

    // Step 3: Notify backend for admin dashboard
    try {
      console.log("📤 Notifying backend for admin dashboard...");
      await api.post("/auth/signup", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: role.trim(),
        phone: phone.trim(),
        supabaseUserId: data.user.id,
      });
      console.log("✅ Backend notified, admin dashboard updated");
    } catch (backendError) {
      console.error("⚠️  Backend notification failed:", backendError);
      // Still continue - user is created
    }

    console.log("✅ Signup complete! You can now login.");

    return {
      success: true,
      message: "Signup successful! Please login with your credentials.",
      user: {
        id: data.user.id,
        email: data.user.email || "",
      },
    };
  } catch (error: any) {
    console.error("❌ Signup failed:", {
      message: error.message,
      details: error,
    });

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
  const supabase = await getSupabaseClient();
  if (!supabase)
    throw new Error("Supabase config missing. Add constants/supabaseConfig.ts");

  // Clear stored user data
  if (typeof window !== "undefined") {
    localStorage.removeItem("userEmail");
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("❌ Signout error:", error.message);
    throw error;
  }

  console.log("✅ Sign out successful");
}

export async function resetPassword(email: string) {
  const supabase = await getSupabaseClient();
  if (!supabase)
    throw new Error("Supabase config missing. Add constants/supabaseConfig.ts");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/reset-password`,
  });

  if (error) {
    console.error("❌ Reset password error:", error.message);
    throw error;
  }

  console.log("✅ Password reset email sent");
}

export async function watchAuth(
  handler: (user: any | null) => void
): Promise<() => void> {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    handler(null);
    return () => {};
  }

  // Get initial auth state
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    handler(data.session.user);
  } else {
    handler(null);
  }

  // Subscribe to auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      handler(session.user);
    } else {
      handler(null);
    }
  });

  // Return unsubscribe function
  return () => {
    subscription?.unsubscribe();
  };
}

export type AuthUser = any | null;

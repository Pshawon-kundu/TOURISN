import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

interface AuthContextProps {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserRole(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // We only set authenticated if we've verified the role, which checkUserRole does.
        // However, onAuthStateChange fires on login.
        // We'll let the login function handle the initial state setting to ensure role check passes first.
        // But for session persistence (page refresh), the getSession above handles it.
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string, sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role, first_name, last_name, email")
        .eq("auth_id", userId)
        .single();

      if (error) throw error;

      if (data.role === "guide") {
        setUser({ ...sessionUser, ...data });
        setIsAuthenticated(true);
      } else {
        console.warn("User is not a guide:", data.role);
        await supabase.auth.signOut();
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error checking role:", err);
      // await supabase.auth.signOut();
      // setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Perform Supabase Auth login (password should be phone number)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Verify role
        const { data: userData, error: roleError } = await supabase
          .from("users")
          .select("role, first_name, last_name, email, phone")
          .eq("auth_id", data.user.id)
          .single();

        if (roleError) {
          console.error("Role verification error:", roleError);
          await supabase.auth.signOut();
          return { success: false, error: "Failed to verify user profile." };
        }

        if (userData.role !== "guide") {
          await supabase.auth.signOut();
          return {
            success: false,
            error: "Access denied. This portal is for Guides only.",
          };
        }

        setUser({ ...data.user, ...userData });
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: "Login failed." };
    } catch (err: any) {
      console.error("Login error:", err);
      return {
        success: false,
        error:
          err.message ||
          "An unexpected error occurred. Please check your connection.",
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

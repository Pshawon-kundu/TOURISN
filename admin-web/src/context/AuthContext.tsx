import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  adminName: string;
  adminEmail: string;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Auto-login for demo
  const [adminName, setAdminName] = useState("Demo Admin");
  const [adminEmail, setAdminEmail] = useState("admin@toursin.com");

  useEffect(() => {
    // Auto-login for demo purposes
    localStorage.setItem("tourisn-admin-token", "demo-token");
    setIsAuthenticated(true);
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    // Demo mode - just set the auth state
    setAdminName(name);
    setAdminEmail(email);
    setIsAuthenticated(true);
    localStorage.setItem("tourisn-admin-token", "demo-token");
    return true;
  };

  const login = async (email: string, password: string) => {
    // Demo mode - accept any login
    setAdminName("Demo Admin");
    setAdminEmail(email);
    setIsAuthenticated(true);
    localStorage.setItem("tourisn-admin-token", "demo-token");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminName("Admin");
    setAdminEmail("");
    localStorage.removeItem("tourisn-admin-token");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, adminName, adminEmail, login, signup, logout }}
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

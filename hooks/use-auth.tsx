import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { watchAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub = () => {};
    let mounted = true;

    setLoading(true);
    watchAuth((nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
      setError(null);
    })
      .then((cleanup) => {
        unsub = cleanup;
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message ?? "Auth unavailable");
        setLoading(false);
      });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const top = segments[0];
    const isPublic = top === "welcome" || top === "login" || top === "signup";

    if (!user && !isPublic) {
      router.replace("/welcome");
    }
  }, [loading, user, segments, router]);
}

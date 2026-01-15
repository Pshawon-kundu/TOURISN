import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import { firebaseConfig } from "@/constants/firebaseConfig";
import { AuthProvider, useRequireAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initFirebase } from "@/lib/firebase";

// Suppress aria-hidden warnings globally for web
if (typeof window !== "undefined" && Platform.OS === "web") {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    const msg = args[0]?.toString?.() || "";
    if (
      msg.includes("aria-hidden") ||
      msg.includes("pointerEvents") ||
      msg.includes("Blocked aria-hidden") ||
      msg.includes("descendant retained focus")
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    const msg = args[0]?.toString?.() || "";
    if (
      msg.includes("aria-hidden") ||
      msg.includes("Blocked aria-hidden") ||
      msg.includes("descendant retained focus")
    ) {
      return;
    }
    originalError(...args);
  };
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Initialize Firebase immediately when app loads
  useEffect(() => {
    console.log("🚀 Root layout mounted, initializing Firebase...");
    try {
      initFirebase(firebaseConfig);
      setFirebaseReady(true);
      console.log("✅ Firebase initialized in root layout");
    } catch (error) {
      console.error("❌ Error initializing Firebase in root layout:", error);
      setFirebaseReady(true); // Continue anyway
    }
  }, []);

  if (showSplash) {
    return (
      <AnimatedSplashScreen onAnimationFinish={() => setShowSplash(false)} />
    );
  }

  // Wait for Firebase to be ready before rendering auth provider
  if (!firebaseReady) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

function RootNavigation() {
  const colorScheme = useColorScheme();
  useRequireAuth();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="user-signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="guide-registration"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="guides" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="food" options={{ headerShown: false }} />
        <Stack.Screen name="transport" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen
          name="experience-detail"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

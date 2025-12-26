import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider, useRequireAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guides" options={{ headerShown: false }} />
        <Stack.Screen name="guide/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="experience" options={{ headerShown: false }} />
        <Stack.Screen name="hired-confirm" options={{ headerShown: false }} />
        <Stack.Screen
          name="guide-registration"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="guides" />
      <Stack.Screen name="guide" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="transport" />
      <Stack.Screen name="about" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="hired-confirm" />
      <Stack.Screen name="guide-registration" />
      <Stack.Screen name="experience-detail" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="chat" />
      <Stack.Screen name="real-time-chat" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="food" />
      <Stack.Screen name="nid-check" />
      <Stack.Screen name="api-test" />
    </Stack>
  );
}

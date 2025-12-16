import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TrackingScreen() {
  return (
    <ThemedView style={styles.container}>
      <Header title="Live Tracking" />
      <View style={styles.content}>
        <ThemedText type="subtitle">
          Track guide and traveler in real-time
        </ThemedText>
        <ThemedText>
          Live tracking UI will be integrated here (maps + location).
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
});

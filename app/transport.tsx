import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TransportHub() {
  return (
    <ThemedView style={styles.container}>
      <Header title="Transport Hub" />
      <View style={styles.content}>
        <ThemedText type="subtitle">Transport options in Bangladesh</ThemedText>

        <ThemedText type="defaultSemiBold">Car rental</ThemedText>
        <ThemedText>
          • Dhaka to Cox's Bazar: BDT 8,000 - 12,000 (AC SUV, 8-10 hours)
        </ThemedText>
        <ThemedText>
          • Dhaka to Sylhet: BDT 6,000 - 9,000 (5-6 hours)
        </ThemedText>
        <ThemedText>
          • Dhaka to Bandarban/Sajek: BDT 10,000 - 15,000 (10-12 hours)
        </ThemedText>

        <ThemedText type="defaultSemiBold">Bus services</ThemedText>
        <ThemedText>
          • Green Line, Shyamoli, Hanif (AC coaches available)
        </ThemedText>
        <ThemedText>• Approx BDT 1,000 - 2,500 depending on route</ThemedText>

        <ThemedText type="defaultSemiBold">Local transport</ThemedText>
        <ThemedText>
          • CNG/Auto-rickshaw, Uber, Pathao (ride-sharing)
        </ThemedText>
        <ThemedText>• Boat rides in Sylhet & Cox's Bazar</ThemedText>

        <Link href="/booking">
          <Link.Trigger>
            <ThemedText type="link">Book transport</ThemedText>
          </Link.Trigger>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
});

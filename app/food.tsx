import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function FoodGuide() {
  return (
    <ThemedView style={styles.container}>
      <Header title="Food Guide" />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Traditional Bangladeshi Food</ThemedText>

        <ThemedText type="defaultSemiBold">Dhaka</ThemedText>
        <ThemedText>• Kacchi Biryani (Star Kabab, Haji Biryani)</ThemedText>
        <ThemedText>• Fuchka & Chotpoti (Old Dhaka street food)</ThemedText>

        <ThemedText type="defaultSemiBold">Cox's Bazar</ThemedText>
        <ThemedText>• Fresh seafood (grilled fish, prawn curry)</ThemedText>
        <ThemedText>• Shutki (dried fish specialty)</ThemedText>

        <ThemedText type="defaultSemiBold">Sylhet</ThemedText>
        <ThemedText>• Seven-layer tea (Nilkantha Tea Cabin)</ThemedText>
        <ThemedText>• Shatkora beef curry (citrus specialty)</ThemedText>

        <ThemedText type="defaultSemiBold">Bandarban & Sajek</ThemedText>
        <ThemedText>• Bamboo chicken (tribal cooking)</ThemedText>
        <ThemedText>• Pitha (rice cakes) & local vegetables</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
});

import { ActionButton } from "@/components/action-button";
import { Header } from "@/components/header";
import { PaymentCard } from "@/components/payment-card";
import { ThemedView } from "@/components/themed-view";
import { TripDetailCard } from "@/components/trip-detail-card";
import { Spacing } from "@/constants/design";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";

export default function BookingScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    Alert.alert("Success", "Your trip has been confirmed!", [
      { text: "OK", onPress: () => router.push("/(tabs)") },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Confirm Trip" />
      <ScrollView contentContainerStyle={styles.content}>
        <TripDetailCard
          from="Baharein"
          to="Tokyo"
          guests="2 Days 4 Night"
          date="20-05, May, 2022"
        />

        <PaymentCard
          cardNumber={cardNumber}
          password={password}
          onCardNumberChange={setCardNumber}
          onPasswordChange={setPassword}
          expDate="01/24"
          cvv="454"
        />

        <ActionButton onPress={handleConfirm}>Confirm Trip</ActionButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 40 },
});

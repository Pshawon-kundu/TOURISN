import { Colors } from "@/constants/design";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type Step = 0 | 1 | 2 | 3;

export function BookingStepper({ guideId }: { guideId?: string }) {
  const [step, setStep] = useState<Step>(0);
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Booking</ThemedText>

      {step === 0 && (
        <View style={styles.card}>
          <ThemedText type="subtitle">Select date & time</ThemedText>
          <Text style={styles.small}>Example selector (add calendar)</Text>
          <TouchableOpacity style={styles.next} onPress={() => setStep(1)}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View style={styles.card}>
          <ThemedText type="subtitle">Choose places to visit</ThemedText>
          <Text style={styles.small}>Add Ahsan Manzil, Lalbagh Fort etc.</Text>
          <TouchableOpacity style={styles.next} onPress={() => setStep(2)}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <ThemedText type="subtitle">Extras & Transport</ThemedText>
          <Text style={styles.small}>Car rental / Hotel booking options</Text>
          <TouchableOpacity style={styles.next} onPress={() => setStep(3)}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.card}>
          <ThemedText type="subtitle">Confirm & Pay</ThemedText>
          <Text style={styles.small}>Total: BDT 1,200 (example)</Text>
          <TouchableOpacity
            style={styles.pay}
            onPress={() => alert("Payment flow not implemented")}
          >
            <Text style={styles.payText}>Pay with Card / bKash</Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: Colors.surface, padding: 12, borderRadius: 12 },
  small: { color: Colors.textMuted, marginTop: 8 },
  next: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "600" },
  pay: {
    marginTop: 12,
    backgroundColor: Colors.accent,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  payText: { color: "#111", fontWeight: "700" },
});

import { ActionButton } from "@/components/action-button";
import { Header } from "@/components/header";
import { PaymentCard } from "@/components/payment-card";
import { ThemedView } from "@/components/themed-view";
import { TripDetailCard } from "@/components/trip-detail-card";
import { Colors, Radii, Spacing } from "@/constants/design";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function BookingScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [travelerName, setTravelerName] = useState("Mahin Rahman");
  const [phone, setPhone] = useState("+880 1700 123 456");
  const [email, setEmail] = useState("mahin.rahman@email.com");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");

  const handleConfirm = () => {
    Alert.alert("Success", "Your trip has been confirmed!", [
      { text: "OK", onPress: () => router.push("/(tabs)") },
    ]);
  };

  const handleNext = () => {
    if (step === "details") {
      setStep("payment");
      return;
    }
    handleConfirm();
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Confirm Trip" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepper}>
          <StepPill label="Details" active={step === "details"} index={1} />
          <StepDivider />
          <StepPill label="Payment" active={step === "payment"} index={2} />
        </View>

        <TripDetailCard
          from="Baharein"
          to="Tokyo"
          guests="2 Days 4 Night"
          date="20-05, May, 2022"
        />

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler details</Text>
            <InputField
              label="Full name"
              value={travelerName}
              onChangeText={setTravelerName}
              placeholder="Enter traveler name"
            />
            <InputField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Add phone number"
              keyboardType="phone-pad"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Add email"
              keyboardType="email-address"
            />
            <InputField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Special requests (optional)"
              multiline
            />
          </View>
        ) : null}

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Price breakdown</Text>
            <PriceRow label="Base fare" value="$1,450" />
            <PriceRow label="Taxes & fees" value="$120" />
            <PriceRow label="Service fee" value="$25" />
            <PriceRow label="Discount" value="-$50" accent />
            <PriceRow label="Total" value="$1,545" bold />
          </View>
        ) : null}

        {step === "payment" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            <PaymentCard
              cardNumber={cardNumber}
              password={password}
              onCardNumberChange={setCardNumber}
              onPasswordChange={setPassword}
              expDate="01/24"
              cvv="454"
            />
          </View>
        ) : null}

        <ActionButton onPress={handleNext}>
          {step === "details" ? "Continue to payment" : "Confirm & pay"}
        </ActionButton>
      </ScrollView>
    </ThemedView>
  );
}

function StepPill({
  label,
  active,
  index,
}: {
  label: string;
  active: boolean;
  index: number;
}) {
  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <View style={[styles.stepDot, active && styles.stepDotActive]}>
        <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>
          {index}
        </Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function StepDivider() {
  return <View style={styles.stepDivider} />;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function PriceRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text
        style={[
          styles.priceLabel,
          bold && styles.priceLabelBold,
          accent && styles.priceLabelAccent,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.priceValue,
          bold && styles.priceValueBold,
          accent && styles.priceValueAccent,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 40 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: Spacing.sm,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  stepPillActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 12,
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  stepDivider: {
    height: 1,
    width: 30,
    backgroundColor: "#E2E8F0",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#475569",
  },
  priceValue: {
    color: "#0F172A",
    fontWeight: "700",
  },
  priceLabelBold: {
    fontWeight: "800",
    color: "#0F172A",
  },
  priceValueBold: {
    fontSize: 16,
    color: Colors.primary,
  },
  priceLabelAccent: {
    color: "#DC2626",
  },
  priceValueAccent: {
    color: "#DC2626",
  },
});

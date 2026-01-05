import { ActionButton } from "@/components/action-button";
import { Header } from "@/components/header";
import { PaymentCard } from "@/components/payment-card";
import { ThemedView } from "@/components/themed-view";
import { TripDetailCard } from "@/components/trip-detail-card";
import { Colors, Radii, Spacing } from "@/constants/design";
import { createStayBooking, createTransportBooking } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingScreen() {
  const params = useLocalSearchParams();
  const bookingType = (params.type as string) || "transport"; // 'transport' or 'stay'
  const transportType = params.transportType as string;
  const propertyName = params.propertyName as string;
  const propertyType = params.propertyType as string;
  const location = params.location as string;

  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [travelerName, sasync () => {
    setIsSubmitting(true);

    try {
      // Prepare booking data
      const bookingData = {
        userId: "guest_user", // Replace with actual user ID from auth
        travelerName,
        phone,
        email,
        notes,
        baseFare: 1450,
        taxes: 120,
        serviceFee: 25,
        discount: 50,
        totalAmount: 1545,
        paymentMethod: "Credit Card",
        cardLastFour: cardNumber.slice(-4),
      };

      let result;

      if (bookingType === "stay") {
        // Create stay booking
        result = await createStayBooking({
          ...bookingData,
          propertyName: propertyName || "Sea View Resort",
          propertyType: (propertyType as any) || "resort",
          location: location || "Cox's Bazar",
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          numberOfGuests: 2,
          numberOfNights: 2,
        });
      } else {
        // Create transport booking
        result = await createTransportBooking({
          ...bookingData,
          transportType: (transportType as any) || "car",
          from: "Dhaka",
          to: "Cox's Bazar",
          travelDate: new Date().toISOString(),
          duration: "8-10 hrs",
        });
      }

      console.log("Booking created successfully:", result);
      setBookingId(
        result.data?.firebaseId || `TRV${Math.floor(Math.random() * 10000)}`
      );
      setShowThankYou(true);
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Unable to complete booking. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }= useState("+880 1700 123 456");
  const [email, setEmail] = useState("mahin.rahman@email.com");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"details" | "payment">("details");
  const [showThankYou, setShowThankYou] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setShowThankYou(true);
  };

  const handleGoHome = () => {
    setShowThankYou(false);
    router.push("/(tabs)");
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
          <StepPill label="Payment" active disabled={isSubmitting}>
          {isSubmitting
            ? "Processing..."
            : step === "details"
            ? "Continue to payment"
           

        <TripDetailCard
          from="Dhaka"
          to="Cox's Bazar"
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
            />{bookingId
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
            <PriceRow label="Base fare" value="TK 1,450" />
            <PriceRow label="Taxes & fees" value="TK 120" />
            <PriceRow label="Service fee" value="TK 25" />
            <PriceRow label="Discount" value="-TK 50" accent />
            <PriceRow label="Total" value="TK 1,545" bold />
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

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThankYou(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouMessage}>
              Your trip has been confirmed successfully.
            </Text>
            <Text style={styles.bookingId}>
              Booking ID: #TRV{Math.floor(Math.random() * 10000)}
            </Text>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.homeButtonText}>Go Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  thankYouMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  bookingId: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
    fontWeight: "600",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

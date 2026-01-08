import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";

export default function BookingConfirmScreen() {
  const params = useLocalSearchParams<{
    tripName?: string;
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    totalPrice?: string;
    currency?: string;
    itemId?: string;
    itemName?: string;
    itemImage?: string;
    pricePerUnit?: string;
    bookingType?: string;
  }>();

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Payment details
  const [paymentNumber, setPaymentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const tripName = params.tripName ?? "Trip";
  const location = params.location ?? "";
  const checkInDate = params.checkIn ? new Date(params.checkIn) : new Date();
  const checkOutDate = params.checkOut
    ? new Date(params.checkOut)
    : new Date(Date.now() + 86400000);
  const guests = parseInt(params.guests ?? "1");
  const totalPrice = parseFloat(params.totalPrice ?? "0");
  const currency = params.currency ?? "TK";
  const serviceFee = 50;
  const finalTotal = totalPrice + serviceFee;

  const daysDiff = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleConfirmPayment = async () => {
    // Validate inputs
    if (!paymentNumber || paymentNumber.replace(/\s/g, "").length < 15) {
      Alert.alert("Invalid Payment Number", "Please enter a valid card number");
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert("Invalid Password", "Please enter your password");
      return;
    }
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert("Invalid Expiry Date", "Please enter expiry date (MM/YY)");
      return;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert("Invalid CCV", "Please enter a valid CCV");
      return;
    }

    setIsLoading(true);

    try {
      // Get user email from storage
      const userEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;

      if (!userEmail) {
        Alert.alert("Error", "Please login again");
        setIsLoading(false);
        return;
      }

      const bookingData = {
        booking_type: params.bookingType ?? "stay",
        trip_name: tripName,
        location: location,
        check_in_date: checkInDate.toISOString(),
        check_out_date: checkOutDate.toISOString(),
        guests: guests,
        item_id: params.itemId ?? "",
        item_name: params.itemName ?? tripName,
        item_image: params.itemImage ?? "",
        price_per_unit: parseFloat(params.pricePerUnit ?? "0"),
        total_days_or_units: daysDiff,
        subtotal: totalPrice,
        service_fee: serviceFee,
        total_price: finalTotal,
        currency: currency,
        payment_method: "card",
        payment_number: paymentNumber.replace(/\s/g, "").slice(-4), // Store only last 4 digits
        payment_status: "completed",
        booking_status: "confirmed",
      };

      console.log("Creating booking with data:", bookingData);

      const response = await fetch("http://localhost:5001/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      console.log("Booking created successfully:", result);

      // Show success modal
      setShowSuccessModal(true);

      // Navigate to home after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/(tabs)");
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Trip</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Trip Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Summary</Text>

          <View style={styles.infoRow}>
            <Ionicons name="airplane" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Trip Name</Text>
              <Text style={styles.infoValue}>{tripName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(checkInDate)} - {formatDate(checkOutDate)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Guests</Text>
              <Text style={styles.infoValue}>
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment method</Text>

          <View style={styles.paymentInfo}>
            <Text style={styles.sectionLabel}>Payment Info:</Text>

            <Text style={styles.inputLabel}>Pay Number:</Text>
            <TextInput
              style={styles.input}
              value={paymentNumber}
              onChangeText={(text) => {
                // Format card number with spaces every 4 digits
                const formatted = text
                  .replace(/\s/g, "")
                  .match(/.{1,4}/g)
                  ?.join(" ");
                setPaymentNumber(formatted || text);
              }}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={19}
            />

            <Text style={styles.inputLabel}>Password:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />

            <View style={styles.rowInput}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Exp. Date:</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={(text) => {
                    // Auto-format MM/YY
                    let formatted = text.replace(/\D/g, "");
                    if (formatted.length >= 2) {
                      formatted =
                        formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
                    }
                    setExpiryDate(formatted);
                  }}
                  placeholder="01/24"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CCV:</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="454"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {currency} {(totalPrice / daysDiff).toLocaleString()} x {daysDiff}{" "}
              {daysDiff === 1 ? "night" : "nights"}
            </Text>
            <Text style={styles.priceValue}>
              {currency} {totalPrice.toLocaleString()}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>
              {currency} {serviceFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {currency} {finalTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isLoading && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & pay</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your trip has been booked successfully
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetailText}>
                Booking ID: #
                {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </Text>
              <Text style={styles.successDetailText}>
                Total: {currency} {finalTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl + 8,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: Radii.large,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  paymentInfo: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: Radii.medium,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  rowInput: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  successContent: {
    backgroundColor: Colors.background,
    borderRadius: Radii.large,
    padding: Spacing.xl * 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    maxWidth: 400,
    width: "100%",
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  successDetails: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: Radii.medium,
    padding: Spacing.lg,
    width: "100%",
    gap: Spacing.sm,
  },
  successDetailText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
});

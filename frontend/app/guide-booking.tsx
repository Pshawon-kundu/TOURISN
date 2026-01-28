import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { APIClient } from "@/lib/api";
import { getSupabaseClient } from "@/lib/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Use the singleton API instance that might share configuration,
// or create a local one. We will ensure token is set before use.
const apiClient = new APIClient();

export default function GuideBookingScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    guideId: string;
    guideName: string;
    rate: string;
    photo: string;
  }>();

  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState("4");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Rate parsing
  const hourlyRate = parseInt(params.rate?.replace(/[^\d]/g, "") || "500", 10);
  const total = hourlyRate * parseInt(hours || "0", 10);

  const handleBook = async () => {
    if (!hours || isNaN(parseInt(hours))) {
      Alert.alert("Error", "Please enter valid hours");
      return;
    }

    setLoading(true);
    console.log("🚀 Starting booking process...");

    try {
      // 1. Get Authentication Token
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        console.error("❌ No active session found");
        Alert.alert("Error", "You must be logged in to book a guide.");
        setLoading(false);
        return;
      }

      console.log("🔑 Auth token retrieved, setting on API client...");
      apiClient.setToken(session.access_token);

      // 2. Prepare Payload
      const checkOutDate = new Date(date);
      checkOutDate.setHours(checkOutDate.getHours() + parseInt(hours));

      const payload = {
        booking_type: "guide",
        item_id: params.guideId,
        item_name: params.guideName,
        check_in_date: date.toISOString(),
        check_out_date: checkOutDate.toISOString(),
        total_days_or_units: parseInt(hours),
        price_per_unit: hourlyRate,
        total_price: total,
        booking_status: "confirmed",
        payment_status: "pending",
        currency: "TK",
      };

      console.log(
        "📤 Sending payload to /bookings:",
        JSON.stringify(payload, null, 2),
      );

      // 3. Send Request
      const response = await apiClient.post("/bookings", payload);

      console.log("✅ Booking response:", response);

      // 4. Success Alert
      if (Platform.OS === "web") {
        window.alert("Thank You\nYour booking Done, Stay with us!");
        router.push("/(tabs)/profile");
      } else {
        Alert.alert("Thank You", "Your booking Done, Stay with us!", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/profile"),
          },
        ]);
      }
    } catch (err: any) {
      console.error("❌ Booking failed:", err);
      if (Platform.OS === "web") {
        window.alert(
          "Error\nFailed to book guide: " + (err.message || "Unknown error"),
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to book guide: " + (err.message || "Unknown error"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Book Guide" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Guide Summary */}
        <View style={styles.card}>
          <Text style={styles.label}>Guide</Text>
          <Text style={styles.value}>
            {params.guideName || "Unknown Guide"}
          </Text>
          <Text style={styles.subValue}>{params.rate || "Rate TBD"}</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text>{date.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hours (Duration)</Text>
            <TextInput
              style={styles.input}
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Meeting point, special requests..."
              multiline
            />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text>Rate</Text>
            <Text>৳{hourlyRate}/hr</Text>
          </View>
          <View style={styles.row}>
            <Text>Duration</Text>
            <Text>{hours} hours</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>৳{total}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  value: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  subValue: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  inputGroup: { marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: Radii.md,
    padding: Spacing.md,
    backgroundColor: "#F9FAFB",
    alignItems: "flex-start",
  },
  summaryCard: {
    backgroundColor: "#F0FDFA",
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#CCD",
    paddingTop: 8,
    marginTop: 4,
  },
  totalText: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radii.full,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

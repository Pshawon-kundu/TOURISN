import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

export default function HiredConfirmScreen() {
  const guide = {
    id: "g1",
    name: "Riaz Afridi",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
  };

  const params = useLocalSearchParams<{
    payment?: string;
    paymentDisplay?: string;
    total?: string;
    provider?: string;
    tripName?: string;
    tripStartDate?: string;
    tripDuration?: string;
    tripTravelers?: string;
  }>();

  const paymentSummary = useMemo(() => {
    if (!params.paymentDisplay && !params.payment) return "Payment on file";
    return params.paymentDisplay ?? params.payment;
  }, [params.payment, params.paymentDisplay]);

  const totalDisplay = params.total ?? "TK —";
  const tripTitle = params.tripName ?? "Experience Bangladesh";
  const tripStartDate = params.tripStartDate ?? "Start date TBD";
  const tripDuration = params.tripDuration ?? "";
  const tripTravelers = params.tripTravelers ?? "Travelers TBD";
  const tripDateSummary = tripDuration
    ? `${tripStartDate} • ${tripDuration}`
    : tripStartDate;

  const handleOk = () => {
    router.back();
  };

  const handleHireNow = () => {
    router.push("/chat");
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
        <Text style={styles.headerTitle}>Guide</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Guide Photo */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: guide.photo }} style={styles.photo} />
        </View>

        {/* Guide Name */}
        <View style={styles.nameCard}>
          <Text style={styles.guideName}>{guide.name}</Text>
        </View>

        {/* Confirmation Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={40} color="#FFF" />
          </View>
        </View>

        {/* Confirmation Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Thank you for booking!</Text>
          <Text style={styles.messageSubtitle}>
            Your trip is confirmed. Your guide will contact you soon with
            details and next steps.
          </Text>
          {/* Demo chat between Bangladeshi traveler and local guide */}
          <View style={{ width: "100%", marginTop: Spacing.lg }}>
            <Text
              style={{
                fontWeight: "700",
                marginBottom: 8,
                color: Colors.textPrimary,
              }}
            >
              Demo chat:
            </Text>
            <View style={{ marginBottom: 6 }}>
              <Text style={{ color: Colors.textPrimary }}>
                <Text style={{ fontWeight: "700" }}>Traveler:</Text> Assalamu
                alaikum! Excited for the trip. Will you meet us at the airport?
              </Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={{ color: Colors.textSecondary }}>
                <Text style={{ fontWeight: "700" }}>Guide:</Text> Wa alaikum
                assalam! Yes, I will be waiting at Dhaka airport with a sign.
                Let me know your flight time.
              </Text>
            </View>
            <View style={{ marginBottom: 6 }}>
              <Text style={{ color: Colors.textPrimary }}>
                <Text style={{ fontWeight: "700" }}>Traveler:</Text> Our flight
                lands at 10:30 AM. Looking forward to exploring Old Dhaka!
              </Text>
            </View>
            <View>
              <Text style={{ color: Colors.textSecondary }}>
                <Text style={{ fontWeight: "700" }}>Guide:</Text> Wonderful! I
                have planned a heritage walk and street food tasting for you.
                See you soon!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Trip</Text>
            <Text style={styles.summaryValue}>{tripTitle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>{tripDateSummary}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Travelers</Text>
            <Text style={styles.summaryValue}>{tripTravelers}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment method</Text>
            <Text style={styles.summaryValue}>{paymentSummary}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{totalDisplay}</Text>
          </View>
        </View>

        {/* OK Button */}
        <TouchableOpacity style={styles.okButton} onPress={handleOk}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />

        {/* Hire Now Button at Bottom */}
        <TouchableOpacity style={styles.hireButton} onPress={handleHireNow}>
          <Text style={styles.hireButtonText}>Hire Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A8C5E0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: "transparent",
    paddingTop: Spacing.xl + 8,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  photoContainer: {
    width: 160,
    height: 200,
    borderRadius: Radii.medium,
    overflow: "hidden",
    backgroundColor: "#FFF",
    marginBottom: Spacing.md,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nameCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.medium,
    marginBottom: Spacing.xl,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  badgeContainer: {
    marginBottom: Spacing.lg,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeIcon: {
    fontSize: 40,
    color: "#FFF",
    fontWeight: "bold",
  },
  messageCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.medium,
    marginBottom: Spacing.xl,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  messageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.medium,
    marginBottom: Spacing.xl,
    width: "100%",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: Colors.textSecondary,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  okButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: Spacing.xxl + 16,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  hireButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: Spacing.xxl + 32,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radii.full,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    width: "80%",
    alignItems: "center",
  },
  hireButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
  },
});

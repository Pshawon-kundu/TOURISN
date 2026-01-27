import { Ionicons } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BookingStepper } from "@/components/booking-stepper";
import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";

export default function GuideProfile() {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;
  const [isNavigating, setIsNavigating] = useState(false);

  const handleChatPress = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      router.push({
        pathname: "/chat-room",
        params: {
          guideId: id || "g1",
          guideName: id ? `${id} — Local guide` : "Arif — Dhaka specialist",
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Chat Unavailable",
        "Failed to open chat. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBookPress = () => {
    router.push(`/booking?guide=${id ?? "g1"}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Guide profile" }} />
      <Header title="Guide profile" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header with Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${id || "Arif"}&background=3B82F6&color=fff&size=120&bold=true`,
              }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            </View>
          </View>
          <Text style={styles.guideName}>
            {id ? `${id} — Local guide` : "Arif — Dhaka specialist"}
          </Text>
          <Text style={styles.guideSubtitle}>City & historical tours</Text>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="language" size={16} color="#3B82F6" />
            <Text style={styles.badgeText}>Bangla / English</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.sectionContent}>
            Experienced guide from Dhaka. Knows local history, food spots, and
            hidden gems. NID verified.
          </Text>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Availability</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#64748B" />
            <Text style={styles.sectionContent}>
              Mon–Sat, 8:00 AM — 6:00 PM
            </Text>
          </View>
        </View>

        {/* Rates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Rates</Text>
          </View>
          <View style={styles.ratesContainer}>
            <View style={styles.rateItem}>
              <Ionicons name="sunny-outline" size={18} color="#F59E0B" />
              <Text style={styles.rateText}>BDT 1,200 / half-day</Text>
            </View>
            <View style={styles.rateItem}>
              <Ionicons name="sunny" size={18} color="#F59E0B" />
              <Text style={styles.rateText}>BDT 2,000 / full-day</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.chatButton, isNavigating && styles.buttonDisabled]}
            onPress={handleChatPress}
            disabled={isNavigating}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>Chat Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Book Tour</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking</Text>
          </View>
          <BookingStepper guideId={id} />
          <Link href={`/booking?guide=${id ?? "g1"}`} asChild>
            <Text style={styles.linkText}>Open full booking page</Text>
          </Link>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, gap: 16 },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 2,
  },
  guideName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  guideSubtitle: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  // Badges
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  // Sections
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Rates
  ratesContainer: {
    gap: 10,
  },
  rateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Link
  linkText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

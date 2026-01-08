import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BookingStepper } from "@/components/booking-stepper";
import { Chip } from "@/components/chip";
import { GuideCard } from "@/components/guide-card";
import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function GuideProfile() {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Guide profile" }} />
      <Header title="Guide profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <GuideCard
          name={id ? `${id} — Local guide` : "Arif — Dhaka specialist"}
          subtitle="City & historical tours"
        />

        <View style={styles.row}>
          <Chip style={{ marginRight: 8 }}>Verified</Chip>
          <Chip>Bangla / English</Chip>
        </View>

        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText>
          Experienced guide from Dhaka. Knows local history, food spots, and
          hidden gems. NID verified.
        </ThemedText>

        <ThemedText type="subtitle">Availability</ThemedText>
        <ThemedText>Mon–Sat, 8:00 AM — 6:00 PM</ThemedText>

        <ThemedText type="subtitle">Rates</ThemedText>
        <ThemedText>BDT 1,200 / half-day • BDT 2,000 / full-day</ThemedText>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/chat-room",
                params: {
                  guideId: id || "g1",
                  guideName: id
                    ? `${id} — Local guide`
                    : "Arif — Dhaka specialist",
                },
              })
            }
          >
            <Text style={styles.chatButtonText}>💬 Chat Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push(`/booking?guide=${id ?? "g1"}`)}
          >
            <Text style={styles.bookButtonText}>📅 Book Tour</Text>
          </TouchableOpacity>
        </View>

        <BookingStepper guideId={id} />

        <Link href={`/booking?guide=${id ?? "g1"}`}>
          <Link.Trigger>
            <ThemedText type="link">Open full booking page</ThemedText>
          </Link.Trigger>
        </Link>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  row: { flexDirection: "row" },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  chatButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

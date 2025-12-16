import { Colors, Radii, Spacing } from "@/constants/design";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TripDetailCardProps {
  from: string;
  to: string;
  guests?: string;
  nights?: string;
  date?: string;
}

export function TripDetailCard({
  from,
  to,
  guests,
  nights,
  date,
}: TripDetailCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Details</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>{from}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>⇄</Text>
        </View>
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>{to}</Text>
        </View>
      </View>

      {(guests || nights || date) && (
        <View style={styles.detailsContainer}>
          {guests && (
            <View style={styles.detailRow}>
              <Text style={styles.icon}>👥</Text>
              <Text style={styles.detailText}>{guests}</Text>
            </View>
          )}
          {nights && (
            <View style={styles.detailRow}>
              <Text style={styles.icon}>🌙</Text>
              <Text style={styles.detailText}>{nights}</Text>
            </View>
          )}
          {date && (
            <View style={styles.detailRow}>
              <Text style={styles.icon}>📅</Text>
              <Text style={styles.detailText}>{date}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  locationBox: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  arrowContainer: {
    marginHorizontal: Spacing.sm,
  },
  arrow: {
    fontSize: 24,
    color: Colors.primary,
  },
  detailsContainer: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

import { Colors, Radii, Spacing } from "@/constants/design";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function ProfileHero({
  name,
  avatar,
  stats,
}: {
  name: string;
  avatar?: any;
  stats?: { countries?: number; cities?: number; days?: number };
}) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.row}>
        <Image
          source={avatar ?? require("@/assets/images/react-logo.png")}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <ThemedText type="title">{name}</ThemedText>
          <View style={styles.chips}>
            <ThemedText type="defaultSemiBold" style={styles.chip}>
              Traveler
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.tag}>
              Mountains
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.statsRow}>
        <ThemedText>{stats?.countries ?? 0} Countries</ThemedText>
        <ThemedText>{stats?.cities ?? 0} Cities</ThemedText>
        <ThemedText>{stats?.days ?? 0} Days</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.large,
    padding: Spacing.md,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 80, height: 80, borderRadius: 12 },
  info: { flex: 1 },
  chips: { flexDirection: "row", gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: Colors.primary,
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    backgroundColor: Colors.secondary,
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});

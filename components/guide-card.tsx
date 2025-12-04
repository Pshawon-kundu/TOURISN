import { Colors, Radii, Spacing } from "@/constants/design";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function GuideCard({
  name,
  subtitle,
  avatar,
}: {
  name: string;
  subtitle?: string;
  avatar?: any;
}) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.row}>
        <Image
          source={avatar ?? require("@/assets/images/react-logo.png")}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold">{name}</ThemedText>
          <ThemedText>{subtitle ?? "Local specialist"}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radii.medium,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 10 },
  info: { flex: 1 },
});

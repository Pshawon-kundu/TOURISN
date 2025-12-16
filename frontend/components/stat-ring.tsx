import { Colors, Typography } from "@/constants/design";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function StatRing({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  // percent calculation retained for future UI variants
  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Text style={styles.value}>{value}</Text>
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 8,
    borderColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { fontSize: 18, color: Colors.textPrimary, fontWeight: "700" },
  label: {
    marginTop: 6,
    color: Colors.textMuted,
    fontSize: Typography.caption,
  },
});

import { Colors } from "@/constants/design";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function Chip({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: { color: "#fff", fontWeight: "600" },
});

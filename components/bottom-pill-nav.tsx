import { Spacing } from "@/constants/design";
import React from "react";
import { StyleSheet, View } from "react-native";

export function BottomPillNav({ children }: { children?: any }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.pill}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  pill: {
    backgroundColor: "#4A6FA5",
    height: 60,
    maxWidth: 400,
    width: "100%",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

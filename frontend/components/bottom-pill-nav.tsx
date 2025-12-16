import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { type ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors as DesignColors, Radii, Spacing } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type NavItem = {
  key: string;
  icon: IconName;
  label: string;
  route: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { key: "home", icon: "home", label: "Home", route: "/" },
  { key: "explore", icon: "explore", label: "Explore", route: "/explore" },
  {
    key: "bookings",
    icon: "luggage",
    label: "Bookings",
    route: "/booking",
    badge: "2",
  },
  {
    key: "profile",
    icon: "person", // use person-filled for clarity
    label: "Profile",
    route: "/profile",
    badge: "1",
  },
];

export function BottomPillNav() {
  const colorScheme = useColorScheme() ?? "light";

  const palette =
    colorScheme === "dark"
      ? {
          barBg: "#0F172A",
          barBorder: "#1F2937",
          text: "#E5E7EB",
          icon: "#E5E7EB",
          badgeBg: "#F87171",
          badgeText: "#FFF",
          shadow: "rgba(0,0,0,0.5)",
        }
      : {
          barBg: "#FFFFFF",
          barBorder: "#E5E5E5",
          text: "#000000",
          icon: "#000000",
          badgeBg: "#FF4D4F",
          badgeText: "#FFF",
          shadow: "#000",
        };

  const actionBg = DesignColors.primary;
  const actionText = "#FFFFFF";

  const primaryAction = {
    icon: "event-available" as IconName,
    label: "Plan Trip",
    route: "/booking",
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: actionBg,
            shadowColor: actionBg,
          },
        ]}
        onPress={() => router.push(primaryAction.route)}
      >
        <MaterialIcons
          name={primaryAction.icon}
          size={18}
          color={actionText}
          style={styles.actionIcon}
        />
        <Text style={[styles.actionLabel, { color: actionText }]}>
          {primaryAction.label}
        </Text>
      </TouchableOpacity>
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.barBg,
            borderTopColor: palette.barBorder,
            shadowColor: palette.shadow,
          },
        ]}
      >
        {navItems.map((item) => {
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.iconRow}>
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={palette.icon}
                />
                {item.badge ? (
                  <View
                    style={[styles.badge, { backgroundColor: palette.badgeBg }]}
                  >
                    <Text
                      style={[styles.badgeText, { color: palette.badgeText }]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, { color: palette.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Spacing.lg,
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingTop: 8,
    paddingBottom: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 2,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
  badge: {
    minWidth: 16,
    paddingHorizontal: 4,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionButton: {
    position: "absolute",
    bottom: Spacing.lg + 6,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  actionIcon: {
    marginBottom: 1,
  },
  actionLabel: {
    fontWeight: "700",
    fontSize: 13,
  },
});

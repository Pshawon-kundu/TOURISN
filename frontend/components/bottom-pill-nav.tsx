import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, usePathname } from "expo-router";
import React, { type ComponentProps } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Spacing } from "@/constants/design";
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
  const pathname = usePathname();

  const palette =
    colorScheme === "dark"
      ? {
          barBg: "rgba(30, 41, 59, 0.95)",
          barBorder: "#334155",
          text: "#F1F5F9",
          textActive: "#10B981",
          icon: "#94A3B8",
          iconActive: "#10B981",
          badgeBg: "#EF4444",
          badgeText: "#FFF",
          shadow: "rgba(0,0,0,0.6)",
          itemBg: "rgba(51, 65, 85, 0.3)",
        }
      : {
          barBg: "rgba(255, 255, 255, 0.98)",
          barBorder: "#E2E8F0",
          text: "#64748B",
          textActive: "#10B981",
          icon: "#64748B",
          iconActive: "#10B981",
          badgeBg: "#EF4444",
          badgeText: "#FFF",
          shadow: "rgba(0, 0, 0, 0.1)",
          itemBg: "rgba(16, 185, 129, 0.08)",
        };

  const actionBg = "#10B981";
  const actionText = "#FFFFFF";

  const primaryAction = {
    icon: "add-location-alt" as IconName,
    label: "Plan Trip",
    route: "/booking",
  };

  const isActive = (route: string) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname?.startsWith(route)) return true;
    return false;
  };

  return (
    <View style={[styles.wrapper, { pointerEvents: "box-none" }]}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: actionBg,
            shadowColor: actionBg,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => router.push(primaryAction.route)}
      >
        <MaterialIcons
          name={primaryAction.icon}
          size={20}
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
            borderColor: palette.barBorder,
            shadowColor: palette.shadow,
          },
        ]}
      >
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.navItem,
                active && {
                  backgroundColor: palette.itemBg,
                  borderRadius: 16,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.iconWrapper}>
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={active ? palette.iconActive : palette.icon}
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
              <Text
                style={[
                  styles.label,
                  { color: active ? palette.textActive : palette.text },
                ]}
              >
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
    paddingBottom: Platform.select({
      ios: Spacing.xl,
      android: Spacing.md,
      default: Spacing.md,
    }),
    backgroundColor: "transparent",
  },
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: Platform.select({
      ios: 18,
      android: 16,
      default: 16,
    }),
    width: "90%",
    maxWidth: 400,
    marginHorizontal: "auto",
    backdropFilter: "blur(10px)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow:
          "0px -6px 24px rgba(0, 0, 0, 0.08), 0px 0px 1px rgba(0, 0, 0, 0.08)",
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 5,
    minHeight: 64,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    paddingHorizontal: 5,
    height: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  actionButton: {
    position: "absolute",
    bottom: Platform.select({
      ios: Spacing.xl + 18,
      android: Spacing.lg + 6,
      default: Spacing.lg + 6,
    }),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 18,
      },
      web: {
        boxShadow: "0px 8px 32px rgba(16, 185, 129, 0.35)",
      },
    }),
  },
  actionIcon: {
    marginBottom: 0,
  },
  actionLabel: {
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

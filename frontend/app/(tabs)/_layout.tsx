import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { ColorSchemes } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = ColorSchemes[colorScheme];
  // Force light theme for the footer as requested
  const footerBg = "#ffffff";
  const footerBorder = "#E2E8F0";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ColorSchemes.light.primary,
        tabBarInactiveTintColor: "#64748B", // Slate 500
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={95}
              style={StyleSheet.absoluteFill}
              tint="light"
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: footerBg,
              }}
            />
          ),
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: Platform.OS === "ios" ? "transparent" : footerBg,
          height: Platform.OS === "ios" ? 85 : 65,
          borderTopWidth: 1,
          borderTopColor: footerBorder,
          shadowOpacity: 0, // Remove shadow
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={26}
                color={color}
              />
              {focused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: ColorSchemes.light.primary },
                  ]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "search" : "search-outline"}
                size={26}
                color={color}
              />
              {focused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: ColorSchemes.light.primary },
                  ]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="experiences"
        options={{
          title: "Experience",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "compass" : "compass-outline"}
                size={26}
                color={color}
              />
              {focused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: ColorSchemes.light.primary },
                  ]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={26}
                color={color}
              />
              {focused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: ColorSchemes.light.primary },
                  ]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="stays"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: Platform.OS === "ios" ? 10 : 0,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
});

import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/design";
import { APIClient } from "@/lib/api";
import { signOut } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const apiClient = new APIClient();

export default function SettingsScreen() {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    Appearance.getColorScheme() === "dark",
  );
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDarkModeEnabled(colorScheme === "dark");
    });
    return () => subscription.remove();
  }, []);

  const toggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(value ? "dark" : "light");
    }
    Alert.alert(
      "Dark Mode",
      value ? "Dark mode enabled" : "Light mode enabled",
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error) {
            console.error("Logout failed:", error);
            router.replace("/login");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Call backend to delete data
              await apiClient.deleteAccount();

              // 2. Sign out
              await signOut();

              Alert.alert("Account Deleted", "Your account has been deleted.", [
                { text: "OK", onPress: () => router.replace("/login") },
              ]);
            } catch (error: any) {
              console.error("Delete account error:", error);
              Alert.alert("Error", error.message || "Failed to delete account");
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Settings" />
      <ScrollView style={styles.content}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Location Services</Text>
                <Text style={styles.settingDescription}>
                  Help us provide better recommendations
                </Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#D1D5DB", true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Easier on your eyes at night
                </Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#D1D5DB", true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="finger-print" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or Face ID
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#D1D5DB", true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="person" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingDescription}>
                  Update your personal information
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/change-password")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="key" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/payment-methods")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="card" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Payment Methods</Text>
                <Text style={styles.settingDescription}>
                  Manage your payment options
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert("Help Center", "Feature coming soon")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingDescription}>
                  FAQs and support articles
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert("Contact Us", "Feature coming soon")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Contact Us</Text>
                <Text style={styles.settingDescription}>
                  Get in touch with support
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/privacy-security")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Terms & Privacy</Text>
                <Text style={styles.settingDescription}>Legal information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/about")}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle"
                size={24}
                color={Colors.primary}
              />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>About</Text>
                <Text style={styles.settingDescription}>
                  App version and info
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>
            Danger Zone
          </Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: "#EF4444" }]}>
                  Logout
                </Text>
                <Text style={styles.settingDescription}>
                  Sign out from your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={24} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: "#EF4444" }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tourisn Bangladesh</Text>
          <Text style={styles.footerSubtext}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

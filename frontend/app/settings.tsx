import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Radii, Spacing } from "@/constants/design";
import { api } from "@/lib/api";

interface UserSettings {
  notifications_enabled: boolean;
  location_enabled: boolean;
  dark_mode_enabled: boolean;
  language: string;
  currency: string;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    location_enabled: true,
    dark_mode_enabled: false,
    language: "en",
    currency: "BDT",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response: any = await api.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    setUpdating(true);
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      await api.updateSettings({ [key]: value });
    } catch (error: any) {
      console.error("Failed to update setting:", error);
      // Revert on error
      setSettings(settings);
      Alert.alert("Error", "Failed to update setting");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = () => {
    router.push("/change-password" as any);
  };

  const handlePrivacySecurity = () => {
    router.push("/privacy-security" as any);
  };

  const handlePaymentMethods = () => {
    router.push("/payment-methods" as any);
  };

  const handleHelpCenter = () => {
    Alert.alert(
      "Help Center",
      "Email: support@tourisn.com\nPhone: +880-1234-567890"
    );
  };

  const handleTerms = () => {
    Alert.alert("Terms & Conditions", "Opening terms and conditions...");
  };

  const handleAbout = () => {
    Alert.alert(
      "About Tourisn",
      "Version 1.0.0\n\nYour gateway to amazing travel experiences in Bangladesh."
    );
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear app cache?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await api.clearCache();
            Alert.alert("Success", "Cache cleared successfully");
          } catch {
            Alert.alert("Error", "Failed to clear cache");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Type DELETE to confirm account deletion",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await api.deleteAccount();
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been deleted successfully"
                      );
                      router.replace("/login");
                    } catch (error: any) {
                      Alert.alert(
                        "Error",
                        error.message || "Failed to delete account"
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={Colors.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive booking updates and offers
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications_enabled}
                onValueChange={(value) =>
                  updateSetting("notifications_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: Colors.primary }}
                disabled={updating}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={Colors.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Location Services</Text>
                  <Text style={styles.settingDescription}>
                    Allow location access for better recommendations
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.location_enabled}
                onValueChange={(value) =>
                  updateSetting("location_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: Colors.primary }}
                disabled={updating}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={Colors.primary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    Switch to dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.dark_mode_enabled}
                onValueChange={(value) =>
                  updateSetting("dark_mode_enabled", value)
                }
                trackColor={{ false: "#D1D5DB", true: Colors.primary }}
                disabled={updating}
              />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleChangePassword}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Change Password</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={handlePrivacySecurity}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Privacy & Security</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={handlePaymentMethods}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Payment Methods</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={handleHelpCenter}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Help Center</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={handleTerms}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Terms & Conditions</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} onPress={handleAbout}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>About</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={handleClearCache}>
              <Ionicons name="trash-outline" size={24} color="#F59E0B" />
              <Text style={[styles.linkText, { color: "#F59E0B" }]}>
                Clear Cache
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="warning-outline" size={24} color="#EF4444" />
              <Text style={[styles.linkText, { color: "#EF4444" }]}>
                Delete Account
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: Spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  versionText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

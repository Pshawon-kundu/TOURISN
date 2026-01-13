import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Radii, Spacing } from "@/constants/design";

export default function PrivacySecurityScreen() {
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Download My Data</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow}>
              <Ionicons
                name="eye-off-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Data Sharing Settings</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow}>
              <Ionicons
                name="finger-print"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Biometric Authentication</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow}>
              <Ionicons
                name="key-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Two-Factor Authentication</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow}>
              <Ionicons
                name="time-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.linkText}>Login History</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Your data is encrypted and stored securely. We never share your
            personal information without your consent.
          </Text>
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
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: Spacing.md,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E0F2FE",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    margin: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});

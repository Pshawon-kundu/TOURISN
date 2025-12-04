import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoAbout}>About</Text>
            {"\n"}
            <Text style={styles.logoTourisn}>Tourisn</Text>
          </Text>
        </View>

        {/* World Map Banner */}
        <View style={styles.mapContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
            }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          {/* Network lines overlay effect */}
          <View style={styles.mapOverlay} />
        </View>

        {/* Why Travel with Tourisn? */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Why Travel with Tourisn?</Text>
          <View style={styles.underline} />
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {/* Row 1 */}
          <View style={styles.featureRow}>
            <View style={styles.featureCardLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✓</Text>
              </View>
              <Text style={styles.featureTitle}>Trusted Local Guides</Text>
              <Text style={styles.featureDescription}>
                Verified, community-rated hosts and curated experiences.
              </Text>
            </View>

            <View style={styles.arrowRight}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>

            <View style={styles.featureCardRight}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✓</Text>
              </View>
              <Text style={styles.featureTitle}>Top-rated Quality</Text>
              <Text style={styles.featureDescription}>
                Transparent ratings and support that has your back.
              </Text>
            </View>
          </View>

          {/* Arrow Down Left */}
          <View style={styles.arrowDownLeft}>
            <Text style={styles.arrowIcon}>↓</Text>
          </View>

          {/* Row 2 */}
          <View style={styles.featureRow}>
            <View style={styles.featureCardLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✓</Text>
              </View>
              <Text style={styles.featureTitle}>Seamless Booking</Text>
              <Text style={styles.featureDescription}>
                One platform for stays, rides, food and tours
              </Text>
            </View>

            <View style={styles.arrowRight}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>

            <View style={styles.featureCardRight}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>✓</Text>
              </View>
              <Text style={styles.featureTitle}>Personalized Experiences</Text>
              <Text style={styles.featureDescription}>
                Crafted just for you, every trip feels special
              </Text>
            </View>
          </View>
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialButton, styles.facebook]}>
            <Text style={styles.socialIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.instagram]}>
            <Text style={styles.socialIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.twitter]}>
            <Text style={styles.socialIcon}>🐦</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomPillNav />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  logoText: {
    textAlign: "center",
  },
  logoAbout: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: "400",
  },
  logoTourisn: {
    fontSize: 48,
    color: "#1E90FF",
    fontWeight: "700",
    letterSpacing: -1,
  },
  mapContainer: {
    marginHorizontal: Spacing.lg,
    height: 200,
    borderRadius: Radii.xl,
    overflow: "hidden",
    backgroundColor: "#0A3D62",
    marginBottom: Spacing.xl,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 61, 98, 0.5)",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E90FF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  underline: {
    width: 120,
    height: 3,
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
  },
  featuresContainer: {
    paddingHorizontal: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  featureCardLeft: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "#1E90FF",
    alignItems: "center",
  },
  featureCardRight: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "#1E90FF",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E90FF",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  arrowRight: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDownLeft: {
    alignItems: "flex-start",
    paddingLeft: 60,
    marginVertical: -Spacing.sm,
  },
  arrowIcon: {
    fontSize: 28,
    color: "#1E90FF",
    fontWeight: "700",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  facebook: {
    backgroundColor: "#1877F2",
  },
  instagram: {
    backgroundColor: "#E4405F",
  },
  twitter: {
    backgroundColor: "#1DA1F2",
  },
  socialIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
});

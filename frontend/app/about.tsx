import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

const { width } = Dimensions.get("window");

// Seamless world map texture - High Quality Light Theme Map
const MAP_URI =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop";

export default function AboutScreen() {
  const mapTranslateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite Map Loop
    const startMapAnimation = () => {
      mapTranslateX.setValue(0);
      Animated.loop(
        Animated.timing(mapTranslateX, {
          toValue: -width, // Move by one screen width
          duration: 35000, // Speed of rotation (slower is more realistic)
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startMapAnimation();
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Animated Header Background */}
      <View style={styles.headerBackground}>
        {/* We use two images to create seamless loop effect */}
        <Animated.View
          style={[
            styles.mapTrack,
            { transform: [{ translateX: mapTranslateX }] },
          ]}
        >
          <Image
            source={{ uri: MAP_URI }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          <Image
            source={{ uri: MAP_URI }}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </Animated.View>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.95)",
            Colors.background,
          ]}
          style={styles.mapOverlay}
        />
      </View>

      {/* Header Nav */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <BlurView intensity={20} tint="light" style={styles.backButtonBlur}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* Branding Section */}
          <View style={styles.brandingSection}>
            <Text style={styles.brandTitle}>
              About <Text style={styles.brandHighlight}>Tourisn</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Travel seamlessly, explore locally, experience globally.
            </Text>
          </View>

          {/* Mission Statement */}
          <View style={styles.missionBox}>
            <Text style={styles.missionText}>
              "Our mission is to connect travelers with authentic local
              experiences, reliable transport, and curated stays—all in one
              place."
            </Text>
          </View>

          {/* Main Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Features Flow */}
          <View style={styles.flowContainer}>
            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={styles.stepCardFull}>
                <LinearGradient
                  colors={["#EFF6FF", "#FFFFFF"]}
                  style={styles.stepGradient}
                >
                  <View style={styles.stepHeader}>
                    <View
                      style={[styles.stepIcon, { backgroundColor: "#DBEAFE" }]}
                    >
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={24}
                        color="#2563EB"
                      />
                    </View>
                    <Text style={styles.stepTitle}>Trusted Local Guides</Text>
                  </View>
                  <Text style={styles.stepDesc}>
                    Verified hosts and curated experiences ensuring safety and
                    quality.
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Connector */}
            <View style={styles.connectorCenter}>
              <Ionicons name="arrow-down" size={20} color="#CBD5E1" />
            </View>

            {/* Step 2 & 3 Side by Side */}
            <View style={styles.gridRow}>
              <View style={styles.stepCardHalf}>
                <View style={[styles.stepIcon, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="star" size={22} color="#16A34A" />
                </View>
                <Text style={styles.stepTitleCompact}>Top-rated Quality</Text>
                <Text style={styles.stepDescCompact}>
                  Transparent ratings you can trust.
                </Text>
              </View>

              <View style={styles.helperArrowRight}>
                <Ionicons name="arrow-forward" size={16} color="#CBD5E1" />
              </View>

              <View style={styles.stepCardHalf}>
                <View style={[styles.stepIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="flash" size={22} color="#D97706" />
                </View>
                <Text style={styles.stepTitleCompact}>Seamless Booking</Text>
                <Text style={styles.stepDescCompact}>
                  One app for stays, rides & food.
                </Text>
              </View>
            </View>

            {/* Connector */}
            <View style={styles.connectorCenter}>
              <Ionicons name="arrow-down" size={20} color="#CBD5E1" />
            </View>

            {/* Step 4 */}
            <View style={styles.stepRow}>
              <View style={styles.stepCardFull}>
                <LinearGradient
                  colors={["#FDF4FF", "#FFFFFF"]}
                  style={styles.stepGradient}
                >
                  <View style={styles.stepHeader}>
                    <View
                      style={[styles.stepIcon, { backgroundColor: "#FCE7F3" }]}
                    >
                      <Ionicons name="heart" size={24} color="#DB2777" />
                    </View>
                    <Text style={styles.stepTitle}>
                      Personalized Experiences
                    </Text>
                  </View>
                  <Text style={styles.stepDesc}>
                    Crafted just for you. Because every trip should feel
                    special.
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Socials */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Join our Community</Text>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <LinearGradient
                  colors={["#1877F2", "#1877F2"]}
                  style={styles.socialGradient}
                >
                  <FontAwesome5 name="facebook-f" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn}>
                <LinearGradient
                  colors={["#833AB4", "#FD1D1D", "#FCB045"]}
                  style={styles.socialGradient}
                >
                  <Ionicons name="logo-instagram" size={22} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialBtn}>
                <LinearGradient
                  colors={["#1DA1F2", "#0099EA"]}
                  style={styles.socialGradient}
                >
                  <Ionicons name="logo-twitter" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    overflow: "hidden",
    zIndex: 0,
  },
  mapTrack: {
    flexDirection: "row",
    width: width * 2,
    height: "100%",
  },
  mapImage: {
    width: width,
    height: "100%",
    opacity: 0.85,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerNav: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  content: {
    paddingTop: 180, // Push content down to show map
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  brandingSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  brandSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
    fontWeight: "500",
  },
  missionBox: {
    backgroundColor: "#fff",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  missionText: {
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.textPrimary,
    lineHeight: 26,
    fontWeight: "500",
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  flowContainer: {
    gap: 0,
  },
  stepRow: {
    marginBottom: 0,
  },
  stepCardFull: {
    borderRadius: Radii.xl,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  stepGradient: {
    padding: Spacing.lg,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginLeft: 0,
  },
  connectorCenter: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  stepCardHalf: {
    flex: 1,
    backgroundColor: "#fff",
    padding: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    height: 160,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  stepTitleCompact: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  stepDescCompact: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  helperArrowRight: {
    width: 20,
    alignItems: "center",
  },
  socialSection: {
    marginTop: Spacing.xxl,
    alignItems: "center",
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  socialBtn: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  socialGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

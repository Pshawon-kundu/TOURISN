import { Colors, Radii, Spacing } from "@/constants/design";
import { Link } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Find Your Favorite Place</Text>
          <Text style={styles.subtitle}>& Visit With Us</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>- or continue with -</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, styles.twitterButton]}
            >
              <Text style={styles.socialIcon}>𝕏</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
            >
              <Text style={styles.socialIcon}>f</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    ...Platform.select({
      web: {
        textShadow: "rgba(0,0,0,0.5) 0px 2px 8px",
      },
      ios: {
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
      default: {},
    }),
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginTop: Spacing.xs,
    ...Platform.select({
      web: {
        textShadow: "rgba(0,0,0,0.5) 0px 2px 8px",
      },
      ios: {
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
      default: {},
    }),
  },
  buttonContainer: {
    gap: Spacing.lg,
  },
  loginButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  signupButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: Radii.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  orText: {
    color: "#fff",
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  twitterButton: {
    backgroundColor: "#1DA1F2",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
});

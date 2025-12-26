import { Colors, Radii, Spacing } from "@/constants/design";
import { signUp } from "@/lib/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSignup = async () => {
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, "traveler", fullName);
      setInfo("Account created! Redirecting...");
      router.replace("/");
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start exploring</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[
              styles.signupButton,
              loading ? { opacity: 0.7 } : undefined,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Working..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {(error || info) && (
            <Text
              style={[
                styles.message,
                error ? styles.errorText : styles.infoText,
              ]}
            >
              {error || info}
            </Text>
          )}

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or sign up with</Text>
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

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  errorText: {
    color: "#D22",
  },
  infoText: {
    color: Colors.primary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 22,
    fontWeight: "700",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

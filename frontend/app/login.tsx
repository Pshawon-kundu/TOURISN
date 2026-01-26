import { Colors, Radii, Spacing } from "@/constants/design";
import { api } from "@/lib/api";
import { resetPassword, signIn } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
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

export default function LoginScreen() {
  const [loginMode, setLoginMode] = useState<"standard" | "guide-nid">(
    "standard",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleLogin = async () => {
    setError("");
    setInfo("");

    if (loginMode === "guide-nid") {
      // NID Login Flow
      if (!nidNumber.trim()) {
        setError("Please enter your NID number");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter your phone number");
        return;
      }

      setLoading(true);
      try {
        console.log(
          "Attempting Guide Login with NID:",
          nidNumber,
          "Phone:",
          phone,
        );
        // 1. Backend verification call
        const response: any = await api.loginWithNid(
          nidNumber.trim(),
          phone.trim(),
        );
        console.log("Backend verification success:", response);

        if (response.success && response.email) {
          // 2. Sign in using the retrieved email and Phone as password
          // (Assuming backend set the password to phone number)
          console.log("Signing in with resolved email and phone...");
          await signIn(response.email, phone.trim());
          console.log("Auth sign in successful!");

          // Redirect
          router.replace("/guide-panel/dashboard");
          return;
        } else {
          throw new Error("Verification failed or no email returned.");
        }
      } catch (err: any) {
        console.error("Guide Login Error:", err);
        setError(err?.message || "Guide login failed. Check NID and Phone.");
        setLoading(false);
        return;
      }
    }

    // Validation standard login
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login with:", email.trim());
      await signIn(email.trim(), password);
      console.log("Login successful!");

      // Check user role to redirect appropriately
      // Ideally signIn should return the user role or we fetch it here
      // For now, we will add a check using Supabase directly if possible, or rely on a simple logic
      // Note: In a real app, signIn should return the full user profile including role.

      // We'll rely on our auth hook or a direct check:
      try {
        const { getSupabaseClient } = await import("@/lib/auth");
        const supabase = await getSupabaseClient();
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("users")
              .select("role")
              .eq("id", user.id)
              .single();

            if (profile?.role === "guide") {
              console.log("Redirecting to Guide Panel");
              router.replace("/guide-panel/dashboard");
              return;
            }
          }
        }
      } catch (e) {
        console.error("Role check failed", e);
      }

      // Explicitly navigate to the tabs index (Home)
      router.replace("/(tabs)/index");
    } catch (err: any) {
      console.error("Login error:", err);

      // Better error messages
      let errorMessage = "Login failed";

      if (
        err?.code === "auth/user-not-found" ||
        err?.message?.includes("user-not-found")
      ) {
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (
        err?.code === "auth/wrong-password" ||
        err?.message?.includes("wrong-password")
      ) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (
        err?.code === "auth/invalid-email" ||
        err?.message?.includes("invalid-email")
      ) {
        errorMessage = "Invalid email format.";
      } else if (err?.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Enter your email first");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setInfo("Password reset email sent");
    } catch (err: any) {
      setError(err?.message ?? "Reset failed");
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

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMode === "standard" && styles.activeTab]}
              onPress={() => setLoginMode("standard")}
            >
              <Text
                style={[
                  styles.tabText,
                  loginMode === "standard" && styles.activeTabText,
                ]}
              >
                Traveler Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMode === "guide-nid" && styles.activeTab,
              ]}
              onPress={() => setLoginMode("guide-nid")}
            >
              <Text
                style={[
                  styles.tabText,
                  loginMode === "guide-nid" && styles.activeTabText,
                ]}
              >
                Guide Login
              </Text>
            </TouchableOpacity>
          </View>

          {loginMode === "standard" ? (
            <>
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
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NID Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your National ID Number"
                  placeholderTextColor="#999"
                  value={nidNumber}
                  onChangeText={setNidNumber}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone (+880...)"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          {loginMode === "standard" && (
            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText} onPress={handleReset}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.loginButton, loading ? { opacity: 0.7 } : undefined]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Working..." : "Log In"}
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
            <Text style={styles.dividerText}>or continue with</Text>
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

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/user-signup")}
              testID="signup-button"
            >
              <Text style={styles.signupLink}>Sign Up as Traveler</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>Want to be a travel guide? </Text>
            <TouchableOpacity
              onPress={() => router.push("/guide-registration")}
              testID="guide-register-button"
            >
              <Text style={styles.guideLink}>Register Here</Text>
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
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: Spacing.lg,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    backgroundColor: "#F0F0F0",
    borderRadius: Radii.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: Radii.sm,
  },
  activeTab: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: Colors.primary,
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  guideContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  guideText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  guideLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});

import { Colors, Radii, Spacing } from "@/constants/design";
import { signUp } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const [nidNumber, setNidNumber] = useState("");
  const [age, setAge] = useState("");
  const [expertiseArea, setExpertiseArea] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [perHourRate, setPerHourRate] = useState("");
  const [nidImage, setNidImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const pickNIDImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNidImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    setError("");
    setInfo("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!nidNumber.trim() || nidNumber.length < 10) {
      setError("Valid NID (10+ digits) is required");
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      setError("Valid age is required");
      return;
    }
    if (!expertiseArea.trim()) {
      setError("Expertise area is required");
      return;
    }
    if (!experienceYears.trim() || isNaN(Number(experienceYears))) {
      setError("Valid experience years is required");
      return;
    }
    if (!perHourRate.trim() || isNaN(Number(perHourRate))) {
      setError("Valid per hour rate is required");
      return;
    }
    if (!nidImage) {
      setError("NID image is required");
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      setInfo("Registration completed! Redirecting...");
      setTimeout(() => router.replace("/"), 1500);
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
          <Text style={styles.title}>Become a Local Guide</Text>
          <Text style={styles.subtitle}>
            Registration Phase - Create your account
          </Text>
          <Text style={styles.description}>
            Join us and start exploring as a guide
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
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
              <Text style={styles.label}>Email *</Text>
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
              <Text style={styles.label}>Password *</Text>
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
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* NID Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NID Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NID Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your NID (10-17 digits)"
                placeholderTextColor="#999"
                value={nidNumber}
                onChangeText={setNidNumber}
                keyboardType="numeric"
                maxLength={17}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload NID Image *</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickNIDImage}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.uploadButtonText}>
                  {nidImage ? "Change NID Image" : "Upload NID Image"}
                </Text>
              </TouchableOpacity>
              {nidImage && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: nidImage }} style={styles.nidImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setNidImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Guide Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guide Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expertise Area *</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g., Old Dhaka, Cox's Bazar, Sylhet Tea Gardens"
                placeholderTextColor="#999"
                value={expertiseArea}
                onChangeText={setExpertiseArea}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experience Year *</Text>
              <TextInput
                style={styles.input}
                placeholder="Years of guiding experience"
                placeholderTextColor="#999"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Per Hour Rate (৳) *</Text>
              <View style={styles.rateInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={[styles.input, styles.rateInput]}
                  placeholder="e.g., 500"
                  placeholderTextColor="#999"
                  value={perHourRate}
                  onChangeText={setPerHourRate}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Error/Info Messages */}
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              loading ? { opacity: 0.7 } : undefined,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Completing Registration..." : "Complete Registration"}
            </Text>
          </TouchableOpacity>

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
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  rateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    position: "absolute",
    left: Spacing.md,
    zIndex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  rateInput: {
    paddingLeft: 36,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: Radii.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: "#F0F9FF",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  imagePreview: {
    position: "relative",
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  nidImage: {
    width: "100%",
    height: 150,
    borderRadius: Radii.md,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
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
    paddingHorizontal: Spacing.md,
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

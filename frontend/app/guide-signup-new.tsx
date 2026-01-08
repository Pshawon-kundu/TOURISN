import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/design";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GuideSignupScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    specialties: "",
    languages: "",
    yearsOfExperience: "",
    certifications: "",
    nidNumber: "",
    nidImageUrl: "",
    city: "",
    district: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      return "Please fill in all required fields";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (!formData.phone || !formData.phone.match(/^\+880\d{10}$/)) {
      return "Please enter a valid Bangladesh phone number (+880XXXXXXXXXX)";
    }

    if (!formData.nidNumber || formData.nidNumber.length < 10) {
      return "Please enter a valid NID number (at least 10 digits)";
    }

    return null;
  };

  const handleSignup = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);

    try {
      const backendUrl =
        process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5001";

      const response = await fetch(`${backendUrl}/api/guides/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          specialties: formData.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          languages: formData.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          certifications: formData.certifications
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          nidNumber: formData.nidNumber,
          nidImageUrl: formData.nidImageUrl,
          city: formData.city,
          district: formData.district,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Success! 🎉",
          "Your guide account has been created. Our team will verify your documents and activate your account within 24-48 hours.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        Alert.alert("Signup Failed", data.error || "An error occurred");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Become a Guide</Text>
              <Text style={styles.headerSubtitle}>
                Join our community of local tour guides
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.firstName}
                  onChangeText={(text) => updateField("firstName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.lastName}
                  onChangeText={(text) => updateField("lastName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="guide@example.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => updateField("email", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Phone <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="+880XXXXXXXXXX"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => updateField("phone", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => updateField("password", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Confirm Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  value={formData.bio}
                  onChangeText={(text) => updateField("bio", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialties (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Heritage walks, Food tours"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.specialties}
                  onChangeText={(text) => updateField("specialties", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Languages (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Bangla, English, Hindi"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.languages}
                  onChangeText={(text) => updateField("languages", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="numeric"
                  value={formData.yearsOfExperience}
                  onChangeText={(text) =>
                    updateField("yearsOfExperience", text)
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Certifications (comma-separated)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tour Guide License, First Aid"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.certifications}
                  onChangeText={(text) => updateField("certifications", text)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  NID Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="National ID number"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="numeric"
                  value={formData.nidNumber}
                  onChangeText={(text) => updateField("nidNumber", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>NID Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.nidImageUrl}
                  onChangeText={(text) => updateField("nidImageUrl", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dhaka"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.city}
                  onChangeText={(text) => updateField("city", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>District</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Dhaka"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={formData.district}
                  onChangeText={(text) => updateField("district", text)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    Create Guide Account
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push("/login")}
                >
                  Login here
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  form: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: Spacing.sm,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  footerLink: {
    color: "#3B82F6",
    fontWeight: "700",
  },
});

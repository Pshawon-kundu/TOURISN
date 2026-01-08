import { useAuth } from "@/hooks/use-auth";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { signUp } from "@/lib/auth";

export default function GuideRegistrationScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<"auth" | "details" | "nid" | "expertise">(
    "details"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidImage, setNidImage] = useState<string | null>(null);
  const [nidVerified, setNidVerified] = useState(false);
  const [expertiseArea, setExpertiseArea] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [perHourRate, setPerHourRate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in or not logged in, adjust initial step
    if (!user) {
      setStep("auth");
    } else {
      setStep("details");
    }
  }, [user]);

  useEffect(() => {
    // Suppress aria-hidden warning for web
    if (typeof window !== "undefined" && Platform.OS === "web") {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        if (args[0]?.includes?.("aria-hidden")) return;
        originalWarn(...args);
      };
      return () => {
        console.warn = originalWarn;
      };
    }
  }, []);

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

  const handleNIDVerification = () => {
    if (nidNumber.length < 10) {
      Alert.alert("Invalid NID", "NID Number must be at least 10 digits");
      return;
    }
    if (!nidImage) {
      Alert.alert("Required", "Please upload your NID image");
      return;
    }
    // Simulate NID verification
    Alert.alert("Success", "NID verified successfully!");
    setNidVerified(true);
  };

  const handleNext = async () => {
    if (step === "auth") {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Required", "Please enter email and password");
        return;
      }
      setStep("details");
    } else if (step === "details") {
      if (!fullName.trim()) {
        Alert.alert("Required", "Please enter your full name");
        return;
      }
      if (!age.trim() || isNaN(Number(age))) {
        Alert.alert("Required", "Please enter a valid age");
        return;
      }
      setStep("nid");
    } else if (step === "nid") {
      if (!nidVerified) {
        Alert.alert("Required", "Please verify your NID");
        return;
      }
      setStep("expertise");
    }
  };

  const handleSubmit = async () => {
    if (!expertiseArea.trim()) {
      Alert.alert("Required", "Please enter your expertise area");
      return;
    }
    if (!experienceYears.trim() || isNaN(Number(experienceYears))) {
      Alert.alert("Required", "Please enter valid years of experience");
      return;
    }
    if (!perHourRate.trim() || isNaN(Number(perHourRate))) {
      Alert.alert("Required", "Please enter a valid per hour rate");
      return;
    }

    setLoading(true);
    try {
      // Parse full name into first and last name
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // If user is not logged in, sign them up first
      let userEmail = email.trim();
      let userPassword = password;

      if (!user) {
        console.log("Creating new guide user account...");
        await signUp(
          userEmail,
          userPassword,
          firstName,
          lastName,
          "guide", // Role
          "" // Phone
        );
        // Wait a moment for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log("Submitting guide registration to /api/guides/signup");

      // Call the new signup endpoint
      const response = await fetch("http://localhost:5001/api/guides/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          firstName,
          lastName,
          phone: "", // Not collected in this form
          bio: `Expert in ${expertiseArea} with ${experienceYears} years of experience`,
          specialties: expertiseArea,
          languages: "English", // Default, can be added to form later
          yearsOfExperience: Number(experienceYears),
          certifications: "",
          nidNumber: nidNumber,
          nidImageUrl: nidImage || "",
          city: "", // Not collected in this form
          district: "", // Not collected in this form
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Guide registration response:", data);

      Alert.alert("Success", "Registration submitted successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (err: any) {
      console.error("Guide registration error:", err);
      Alert.alert("Error", err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "auth") {
      router.back();
    } else if (step === "details") {
      if (!user) setStep("auth");
      else router.back();
    } else if (step === "nid") {
      setStep("details");
    } else {
      setStep("nid");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Local Guide</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {!user && (
          <>
            <ProgressStep
              number={0}
              label="Account"
              active={step === "auth"}
              completed={step !== "auth"}
            />
            <ProgressDivider completed={step !== "auth"} />
          </>
        )}
        <ProgressStep
          number={1}
          label="Details"
          active={step === "details"}
          completed={step !== "details" && step !== "auth"}
        />
        <ProgressDivider completed={step === "nid" || step === "expertise"} />
        <ProgressStep
          number={2}
          label="NID Verify"
          active={step === "nid"}
          completed={step === "expertise"}
        />
        <ProgressDivider completed={step === "expertise"} />
        <ProgressStep
          number={3}
          label="Expertise"
          active={step === "expertise"}
          completed={false}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 0: Auth (New Users) */}
        {step === "auth" && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create Account</Text>
            <Text style={styles.stepDescription}>
              Create a guide account to get started.
            </Text>

            <View style={styles.fieldWrapper}>
              <Label icon="mail" label="Email" required />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldWrapper}>
              <Label icon="lock-closed" label="Password" required />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>
        )}

        {/* Step 1: Personal Details */}
        {step === "details" && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepDescription}>
              Tell us about yourself. This information will be verified and
              displayed on your guide profile.
            </Text>

            {/* Full Name */}
            <View style={styles.fieldWrapper}>
              <Label icon="person" label="Name" required />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Age */}
            <View style={styles.fieldWrapper}>
              <Label icon="calendar" label="Age" required />
              <TextInput
                style={styles.input}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#0EA5E9" />
              <Text style={styles.infoText}>
                Your information is secure and will only be used for
                verification purposes.
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: NID Verification */}
        {step === "nid" && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>NID Verification</Text>
            <Text style={styles.stepDescription}>
              Verify your identity with your National ID Number. This ensures
              trust and safety in our community.
            </Text>

            {/* NID Number Input */}
            <View style={styles.fieldWrapper}>
              <Label icon="shield-checkmark" label="NID" required />
              <TextInput
                style={styles.input}
                placeholder="Enter your NID number"
                placeholderTextColor="#999"
                value={nidNumber}
                onChangeText={setNidNumber}
                keyboardType="numeric"
                maxLength={17}
              />
              <Text style={styles.helperText}>
                Bangladesh NID format: typically 10-17 digits
              </Text>
            </View>

            {/* Upload NID Image */}
            <View style={styles.fieldWrapper}>
              <Label icon="image" label="Upload NID Image" required />
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
              <Text style={styles.helperText}>
                Upload a clear photo of your NID card
              </Text>
            </View>

            {/* Verification Status */}
            {nidVerified && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.successTitle}>NID Verified</Text>
                  <Text style={styles.successText}>
                    Your NID has been successfully verified.
                  </Text>
                </View>
              </View>
            )}

            {/* Verify Button */}
            {!nidVerified && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleNIDVerification}
              >
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                <Text style={styles.verifyButtonText}>Verify NID</Text>
              </TouchableOpacity>
            )}

            {/* Security Notice */}
            <View style={styles.securityBox}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#F59E0B"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.securityTitle}>Secure & Private</Text>
                <Text style={styles.securityText}>
                  Your NID is encrypted and stored securely. We never share your
                  personal information.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Expertise */}
        {step === "expertise" && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Your Expertise</Text>
            <Text style={styles.stepDescription}>
              Share your knowledge and experience to attract travelers.
            </Text>

            {/* Expertise Area */}
            <View style={styles.fieldWrapper}>
              <Label icon="location" label="Expertise Area" required />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g., Old Dhaka, Cox's Bazar, Sylhet Tea Gardens, Bandarban Hills"
                placeholderTextColor="#999"
                value={expertiseArea}
                onChangeText={setExpertiseArea}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.helperText}>
                List the places and regions you know best
              </Text>
            </View>

            {/* Experience Years */}
            <View style={styles.fieldWrapper}>
              <Label icon="briefcase" label="Experience Year" required />
              <TextInput
                style={styles.input}
                placeholder="e.g., 5"
                placeholderTextColor="#999"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                Total years of experience as a guide
              </Text>
            </View>

            {/* Per Hour Rate */}
            <View style={styles.fieldWrapper}>
              <Label icon="cash" label="Per Hour Rate" required />
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
              <Text style={styles.helperText}>Set your hourly rate in BDT</Text>
            </View>

            {/* Benefits Box */}
            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>
                Benefits of Being a Guide:
              </Text>
              <BenefitItem icon="trending-up" text="Earn competitive rates" />
              <BenefitItem icon="people" text="Connect with travelers" />
              <BenefitItem icon="star" text="Build your reputation" />
              <BenefitItem icon="calendar" text="Flexible scheduling" />
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {step !== "details" && step !== "auth" && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step === "details" && user && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {(step === "auth" || (step === "details" && !user)) && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {step === "expertise" ? (
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1, marginLeft: Spacing.md }]}
            onPress={handleSubmit}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>
              {loading ? "Registering..." : "Submit Registration"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1, marginLeft: Spacing.md }]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {step === "nid" && nidVerified
                ? "Continue"
                : step === "auth"
                ? "Account Created? Next"
                : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <BottomPillNav />
    </ThemedView>
  );
}

function ProgressStep({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <View style={styles.progressStep}>
      <View
        style={[
          styles.progressStepCircle,
          active && styles.progressStepCircleActive,
          completed && styles.progressStepCircleCompleted,
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={16} color="#FFF" />
        ) : (
          <Text
            style={[
              styles.progressStepNumber,
              active && styles.progressStepNumberActive,
            ]}
          >
            {number}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.progressStepLabel,
          active && styles.progressStepLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ProgressDivider({ completed }: { completed: boolean }) {
  return (
    <View
      style={[
        styles.progressDivider,
        completed && styles.progressDividerCompleted,
      ]}
    />
  );
}

function Label({
  icon,
  label,
  required,
}: {
  icon: string;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={styles.labelContainer}>
      <Ionicons name={icon as any} size={16} color={Colors.primary} />
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    </View>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },
  progressStepCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  progressStepCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressStepNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#999",
  },
  progressStepNumberActive: {
    color: Colors.primary,
  },
  progressStepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  progressStepLabelActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  progressDivider: {
    width: 30,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  progressDividerCompleted: {
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: 100,
  },
  stepContainer: {
    gap: Spacing.lg,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fieldWrapper: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  required: {
    color: "#EF4444",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: "#F9FAFB",
    color: Colors.textPrimary,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E0F7FA",
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#0369A1",
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  successText: {
    fontSize: 13,
    color: "#059669",
    marginTop: 2,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
  },
  securityText: {
    fontSize: 13,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 18,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.md,
    gap: 8,
    marginTop: Spacing.sm,
  },
  verifyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  benefitsBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: Radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 75,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingVertical: Spacing.md,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 16,
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
    height: 200,
    borderRadius: Radii.md,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#FFF",
    borderRadius: 20,
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
});

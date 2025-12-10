import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function GuideRegistrationScreen() {
  const [step, setStep] = useState<"details" | "nid" | "expertise">("details");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidVerified, setNidVerified] = useState(false);
  const [expertisePlaces, setExpertisePlaces] = useState("");
  const [experience, setExperience] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const handleNIDVerification = () => {
    if (nidNumber.length < 10) {
      Alert.alert("Invalid NID", "NID Number must be at least 10 digits");
      return;
    }
    // Simulate NID verification
    Alert.alert("Success", "NID verified successfully!");
    setNidVerified(true);
  };

  const handleNext = () => {
    if (step === "details") {
      if (!fullName.trim()) {
        Alert.alert("Required", "Please enter your full name");
        return;
      }
      if (!dateOfBirth.trim()) {
        Alert.alert("Required", "Please enter your date of birth");
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

  const handleSubmit = () => {
    if (!expertisePlaces.trim()) {
      Alert.alert("Required", "Please enter your expertise areas");
      return;
    }
    if (!yearsExperience.trim()) {
      Alert.alert("Required", "Please enter years of experience");
      return;
    }

    Alert.alert("Success", "Registration submitted successfully!", [
      {
        text: "OK",
        onPress: () => router.push("/guides"),
      },
    ]);
  };

  const handleBack = () => {
    if (step === "details") {
      router.back();
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
        <ProgressStep
          number={1}
          label="Details"
          active={step === "details"}
          completed={step !== "details"}
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
              <Label icon="person" label="Full Name" required />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldWrapper}>
              <Label icon="calendar" label="Date of Birth" required />
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
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
              <Label icon="shield-checkmark" label="NID Number" required />
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

            {/* Expertise Places */}
            <View style={styles.fieldWrapper}>
              <Label icon="location" label="Areas of Expertise" required />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="e.g., Old Dhaka, Cox's Bazar, Sylhet Tea Gardens, Bandarban Hills"
                placeholderTextColor="#999"
                value={expertisePlaces}
                onChangeText={setExpertisePlaces}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.helperText}>
                List the places and regions you know best
              </Text>
            </View>

            {/* Years of Experience */}
            <View style={styles.fieldWrapper}>
              <Label icon="briefcase" label="Years of Experience" required />
              <TextInput
                style={styles.input}
                placeholder="e.g., 5 years"
                placeholderTextColor="#999"
                value={yearsExperience}
                onChangeText={setYearsExperience}
              />
            </View>

            {/* Additional Experience Details */}
            <View style={styles.fieldWrapper}>
              <Label icon="document-text" label="About Your Experience" />
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tell travelers about your background and what makes you a great guide"
                placeholderTextColor="#999"
                value={experience}
                onChangeText={setExperience}
                multiline
                numberOfLines={5}
              />
              <Text style={styles.helperText}>
                Share your unique experiences and specialties
              </Text>
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
        {step !== "details" && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step === "expertise" ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1, marginLeft: step !== "details" ? Spacing.md : 0 },
            ]}
            onPress={handleSubmit}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Submit Registration</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1, marginLeft: step !== "details" ? Spacing.md : 0 },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {step === "nid" && nidVerified ? "Continue" : "Next"}
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
});

import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { APIClient } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VerificationStatus {
  id: string;
  status: "pending" | "verified" | "rejected" | "pending_review";
  verification_score: number;
  created_at: string;
  verified_at?: string;
  admin_notes?: string;
}

export default function NidCheck() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);

  // Form fields
  const [nidNumber, setNidNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Validation states
  const [nidError, setNidError] = useState("");
  const [dobError, setDobError] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      const response = await APIClient.get(`/nid/status/${user?.id}`);
      if (response.data.success && response.data.data) {
        setVerificationStatus(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load verification status:", error);
    }
  };

  const validateNID = (nid: string): boolean => {
    // Remove any spaces or dashes
    const cleanedNID = nid.replace(/[\s-]/g, "");

    // Check basic format
    const nidPattern = /^(\d{10}|\d{13}|\d{17})$/;
    if (!nidPattern.test(cleanedNID)) {
      setNidError("NID must be exactly 10, 13, or 17 digits");
      return false;
    }

    // Additional validation for Bangladesh NID patterns
    if (cleanedNID.length === 13) {
      const birthYear = parseInt(cleanedNID.substring(0, 4));
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        setNidError("Invalid birth year in NID number");
        return false;
      }
    }

    if (cleanedNID.length === 17) {
      const birthYear = parseInt(cleanedNID.substring(0, 4));
      const currentYear = new Date().getFullYear();
      if (birthYear < 1900 || birthYear > currentYear) {
        setNidError("Invalid birth year in Smart NID number");
        return false;
      }
    }

    // Check for common invalid patterns
    if (/^(0+|1+|2+|3+|4+|5+|6+|7+|8+|9+)$/.test(cleanedNID)) {
      setNidError("NID cannot be all the same digits");
      return false;
    }

    if (/^(123456|654321|111111|000000)/.test(cleanedNID)) {
      setNidError("Invalid NID pattern detected");
      return false;
    }

    // Enhanced fake pattern detection
    const fakePatterns = [
      /^1234567890$/,
      /^123456789010$/, // The specific fake NID being used
      /^123456789012[37]$/,
      /^1234567890123$/,
    ];

    for (const pattern of fakePatterns) {
      if (pattern.test(cleanedNID)) {
        setNidError(
          "🚨 This appears to be a test/fake NID number. Please enter your actual NID."
        );
        Alert.alert(
          "🚨 Fake NID Detected",
          "The NID number you entered appears to be fake or a test number. Please enter your actual National ID number from your NID card.\n\nUsing fake information may result in account suspension.",
          [{ text: "OK", style: "default" }]
        );
        return false;
      }
    }

    setNidError("");
    return true;
  };

  const validateDOB = (dob: string): boolean => {
    const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobPattern.test(dob)) {
      setDobError("Date format must be YYYY-MM-DD");
      return false;
    }

    const birthDate = new Date(dob);
    const currentDate = new Date();

    // Check if it's a valid date
    if (isNaN(birthDate.getTime())) {
      setDobError("Invalid date");
      return false;
    }

    // Check if date is not in the future
    if (birthDate > currentDate) {
      setDobError("Date of birth cannot be in the future");
      return false;
    }

    // Calculate age more accurately
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setDobError("You must be at least 18 years old");
      return false;
    }

    if (age > 120) {
      setDobError("Invalid age - please check your date of birth");
      return false;
    }

    // Cross-validate with NID if it's 13 or 17 digits
    if (nidNumber.length >= 13) {
      const nidBirthYear = parseInt(nidNumber.substring(0, 4));
      if (Math.abs(nidBirthYear - birthDate.getFullYear()) > 1) {
        setDobError("Date of birth doesn't match the year in your NID");
        return false;
      }
    }

    setDobError("");
    return true;
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to upload NID image"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const validateImage = (imageUri: string): boolean => {
    if (!imageUri) {
      Alert.alert(
        "Image Required",
        "Please upload or capture your NID card image. This is mandatory for verification."
      );
      return false;
    }

    // Check if it's a base64 image
    if (!imageUri.startsWith("data:image/")) {
      Alert.alert(
        "Invalid Image",
        "Please select a valid image file (JPG, PNG, etc.)"
      );
      return false;
    }

    // Check file size (approximate from base64)
    const base64Data = imageUri.split(",")[1];
    if (!base64Data) {
      Alert.alert(
        "Invalid Image",
        "Image data is corrupted. Please try again."
      );
      return false;
    }

    const fileSizeKB = (base64Data.length * 3) / 4 / 1024; // Approximate size in KB
    if (fileSizeKB < 50) {
      Alert.alert(
        "Image Too Small",
        "Image is too small. Please capture a clearer, higher resolution photo."
      );
      return false;
    }

    if (fileSizeKB > 15000) {
      // 15MB limit
      Alert.alert(
        "Image Too Large",
        "Image is too large. Please compress or choose a smaller image."
      );
      return false;
    }

    return true;
  };

  const takePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to capture NID photo"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please login to verify NID");
      return;
    }

    // Validate inputs
    if (!validateNID(nidNumber) || !validateDOB(dateOfBirth)) {
      Alert.alert(
        "Validation Error",
        "Please correct the errors and try again"
      );
      return;
    }

    if (!selectedImage) {
      Alert.alert(
        "Image Required",
        "Please upload or capture your NID card image"
      );
      return;
    }

    // SECURITY WARNING: Inform user about enhanced verification
    Alert.alert(
      "🔒 Enhanced Security Verification",
      "For your security, we use advanced verification methods. Please ensure:\n\n• Your NID number exactly matches the card\n• The image is clear and readable\n• All information is accurate\n\nMost verifications require manual review for security.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Proceed with Verification",
          onPress: () => performVerification(),
        },
      ]
    );
  };

  const performVerification = async () => {
    try {
      setLoading(true);

      const response = await APIClient.post("/nid/verify", {
        userId: user.id,
        nidNumber,
        dateOfBirth,
        nidImageBase64: selectedImage,
      });

      if (response.data.success) {
        // Check if it's actually verified or pending review
        const status = response.data.data?.status || "pending_review";
        const isVerified = status === "verified";
        const isPending = status === "pending_review";

        if (isPending) {
          Alert.alert("⏳ Pending Review", response.data.message, [
            {
              text: "OK",
              onPress: () => {
                loadVerificationStatus();
                // Clear form
                setNidNumber("");
                setDateOfBirth("");
                setSelectedImage(null);
              },
            },
          ]);
        } else if (isVerified) {
          Alert.alert("✅ Verified", response.data.message, [
            {
              text: "OK",
              onPress: () => {
                loadVerificationStatus();
                // Clear form
                setNidNumber("");
                setDateOfBirth("");
                setSelectedImage(null);
              },
            },
          ]);
        }
      } else {
        Alert.alert("Verification Failed", response.data.message);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to verify NID. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    const statusColors = {
      verified: { bg: "#10B981", text: "#FFFFFF", icon: "checkmark-circle" },
      pending: { bg: "#F59E0B", text: "#FFFFFF", icon: "time" },
      pending_review: { bg: "#F59E0B", text: "#FFFFFF", icon: "document-text" },
      rejected: { bg: "#EF4444", text: "#FFFFFF", icon: "close-circle" },
    };

    const statusConfig = statusColors[verificationStatus.status];

    return (
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <Ionicons
            name={statusConfig.icon as any}
            size={24}
            color={statusConfig.text}
          />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {verificationStatus.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>

        <View style={styles.statusDetails}>
          <View style={styles.statusRow}>
            <Ionicons name="star" size={16} color={colors.textSecondary} />
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Verification Score:
            </Text>
            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
              {verificationStatus.verification_score}%
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Submitted:
            </Text>
            <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
              {new Date(verificationStatus.created_at).toLocaleDateString()}
            </Text>
          </View>

          {verificationStatus.verified_at && (
            <View style={styles.statusRow}>
              <Ionicons
                name="checkmark-done"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.statusLabel, { color: colors.textSecondary }]}
              >
                Verified:
              </Text>
              <Text style={[styles.statusValue, { color: colors.textPrimary }]}>
                {new Date(verificationStatus.verified_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {verificationStatus.admin_notes && (
            <View style={styles.notesContainer}>
              <Text
                style={[styles.notesLabel, { color: colors.textSecondary }]}
              >
                Notes:
              </Text>
              <Text style={[styles.notesText, { color: colors.textPrimary }]}>
                {verificationStatus.admin_notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          NID Verification
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.primary + "15",
              borderColor: colors.primary + "30",
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.primary }]}>
            Secure Verification
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Verify your Bangladesh National ID card to access exclusive features
            and build trust with other users.
          </Text>
        </View>

        {/* Current Status */}
        {verificationStatus && renderVerificationStatus()}

        {/* Only show form if not verified */}
        {verificationStatus?.status !== "verified" && (
          <>
            {/* NID Number Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                NID Number <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: nidError ? "#EF4444" : colors.border,
                  },
                ]}
              >
                <Ionicons name="card" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter 10, 13, or 17 digit NID"
                  placeholderTextColor={colors.textSecondary}
                  value={nidNumber}
                  onChangeText={(text) => {
                    setNidNumber(text);
                    if (text.length > 0) validateNID(text);
                  }}
                  keyboardType="number-pad"
                  maxLength={17}
                />
              </View>
              {nidError ? (
                <Text style={styles.errorText}>{nidError}</Text>
              ) : (
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                  Enter your National ID card number
                </Text>
              )}
            </View>

            {/* Date of Birth Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: dobError ? "#EF4444" : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                  placeholderTextColor={colors.textSecondary}
                  value={dateOfBirth}
                  onChangeText={(text) => {
                    setDateOfBirth(text);
                    if (text.length === 10) validateDOB(text);
                  }}
                  maxLength={10}
                />
              </View>
              {dobError ? (
                <Text style={styles.errorText}>{dobError}</Text>
              ) : (
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                  Format: YYYY-MM-DD (Year-Month-Day)
                </Text>
              )}
            </View>

            {/* Image Upload Section */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                NID Card Image <Text style={styles.required}>*</Text>
              </Text>

              {selectedImage ? (
                <View
                  style={[styles.imagePreview, { borderColor: colors.border }]}
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={28} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadButtons}>
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera" size={32} color={colors.primary} />
                    <Text
                      style={[
                        styles.uploadButtonText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      Take Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={pickImage}
                  >
                    <Ionicons name="images" size={32} color={colors.primary} />
                    <Text
                      style={[
                        styles.uploadButtonText,
                        { color: colors.textPrimary },
                      ]}
                    >
                      Choose from Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Upload a clear photo of your NID card (front side)
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Verify NID</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Guidelines */}
            <View
              style={[
                styles.guidelinesCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.guidelinesTitle, { color: colors.textPrimary }]}
              >
                Verification Guidelines
              </Text>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text
                  style={[
                    styles.guidelineText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Ensure NID card is clearly visible
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text
                  style={[
                    styles.guidelineText,
                    { color: colors.textSecondary },
                  ]}
                >
                  All text should be readable
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text
                  style={[
                    styles.guidelineText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Avoid glare and shadows
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text
                  style={[
                    styles.guidelineText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Use good lighting conditions
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  statusCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusDetails: {
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  notesContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  hint: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: Spacing.xs,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  uploadButton: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.full,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  guidelinesCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  guidelineText: {
    fontSize: 14,
    flex: 1,
  },
});

import { Colors, Radii, Spacing } from "@/constants/design";
import { signUp } from "@/lib/auth";
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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidImage, setNidImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const pickNIDImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Please allow access to your photo library to upload NID");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNidImage(result.assets[0].uri);
        setInfo("NID image selected successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadNIDToSupabase = async (uri: string, userId: string): Promise<string | null> => {
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `nid-images/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('nid-documents')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('nid-documents')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('NID upload error:', error);
      return null;
    }
  };

  const extractNIDFromImage = async (imageUrl: string): Promise<string | null> => {
    try {
      // Call backend OCR API to extract NID from image
      const response = await fetch('http://localhost:5001/api/nid/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      
      if (data.success && data.nidNumber) {
        return data.nidNumber;
      }
      
      return null;
    } catch (error) {
      console.error('NID extraction error:', error);
      return null;
    }
  };

  const handleSignup = async () => {
    setError("");
    setInfo("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!nidNumber.trim()) {
      setError("Please enter your NID number");
      return;
    }

    if (!nidImage) {
      setError("Please upload your NID card image");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setInfo("Creating account...");

    try {
      // Step 1: Create user account
      const userResult = await signUp(email.trim(), password, "traveler", fullName);
      
      if (!userResult || !userResult.user) {
        throw new Error("Failed to create account");
      }

      const userId = userResult.user.id;
      setInfo("Account created! Uploading NID...");

      // Step 2: Upload NID image to Supabase
      const nidImageUrl = await uploadNIDToSupabase(nidImage, userId);
      
      if (!nidImageUrl) {
        throw new Error("Failed to upload NID image");
      }

      setInfo("NID uploaded! Verifying...");

      // Step 3: Extract NID number from image
      const extractedNID = await extractNIDFromImage(nidImageUrl);
      
      // Step 4: Verify NID match
      const nidMatches = extractedNID && extractedNID === nidNumber.trim();
      
      // Step 5: Save user data with NID info to Supabase
      const { error: dbError } = await supabase
        .from('users')
        .update({
          nid_number: nidNumber.trim(),
          nid_image_url: nidImageUrl,
          nid_verified: nidMatches,
          nid_verification_date: nidMatches ? new Date().toISOString() : null,
        })
        .eq('id', userId);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error("Failed to save NID information");
      }

      if (!nidMatches) {
        Alert.alert(
          "NID Verification Pending",
          "Your NID will be manually verified by our team. You'll be notified once verified.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        setInfo("Account created successfully! Redirecting...");
        setTimeout(() => router.replace("/"), 1500);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message ?? "Signup failed. Please try again.");
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
            <Text style={styles.label}>NID Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your NID number"
              placeholderTextColor="#999"
              value={nidNumber}
              onChangeText={setNidNumber}
              keyboardType="numeric"
              maxLength={17}
            />
            <Text style={styles.helperText}>Bangladesh NID: 10, 13, or 17 digits</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NID Card Image</Text>
            <TouchableOpacity 
              style={styles.imagePickerButton}
              onPress={pickNIDImage}
            >
              {nidImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: nidImage }} style={styles.imagePreview} />
                  <View style={styles.changeImageOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
                  <Text style={styles.uploadText}>Upload NID Card</Text>
                  <Text style={styles.uploadSubtext}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
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
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: '#F0F9FF',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
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

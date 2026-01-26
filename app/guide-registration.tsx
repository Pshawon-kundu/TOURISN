import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { registerGuide } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001/api";
  }
  return "http://localhost:5001/api";
};

const API_BASE_URL = getApiBaseUrl();

const expertiseCategories = [
  "Historical Sites & Heritage",
  "Natural Landscapes & Parks",
  "Cultural Tours & Festivals",
  "Food & Culinary Tours",
  "Adventure & Trekking",
  "Beach & Coastal Areas",
  "Religious Sites",
  "Photography Tours",
  "Wildlife & Nature",
  "City Tours & Urban Exploration",
];

const bangladeshDistricts = [
  "Dhaka",
  "Faridpur",
  "Gazipur",
  "Gopalganj",
  "Kishoreganj",
  "Madaripur",
  "Manikganj",
  "Munshiganj",
  "Narayanganj",
  "Narsingdi",
  "Rajbari",
  "Shariatpur",
  "Tangail",
  "Chattogram",
  "Bandarban",
  "Brahmanbaria",
  "Chandpur",
  "Cumilla",
  "Cox's Bazar",
  "Feni",
  "Khagrachari",
  "Lakshmipur",
  "Noakhali",
  "Rangamati",
  "Rajshahi",
  "Bogura",
  "Joypurhat",
  "Naogaon",
  "Natore",
  "Chapainawabganj",
  "Pabna",
  "Sirajganj",
  "Khulna",
  "Bagerhat",
  "Chuadanga",
  "Jessore",
  "Jhenaidah",
  "Kushtia",
  "Magura",
  "Meherpur",
  "Narail",
  "Satkhira",
  "Barishal",
  "Barguna",
  "Bhola",
  "Jhalokathi",
  "Patuakhali",
  "Pirojpur",
  "Sylhet",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  "Rangpur",
  "Dinajpur",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  "Mymensingh",
  "Jamalpur",
  "Netrokona",
  "Sherpur",
];

export default function GuideRegistrationScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "nid" | "expertise">("details");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidImage, setNidImage] = useState<string | null>(null);
  const [nidImageUrl, setNidImageUrl] = useState<string | null>(null);
  const [nidVerified, setNidVerified] = useState(false);
  const [experience, setExperience] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [perHourRate, setPerHourRate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedExpertiseCategories, setSelectedExpertiseCategories] =
    useState<string[]>([]);
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nidWarning, setNidWarning] = useState("");

  const checkNIDPattern = (nid: string) => {
    if (!nid) {
      setNidWarning("");
      return;
    }

    // Check for fake patterns
    const fakePatterns = [
      /^1234567890$/,
      /^123456789010$/,
      /^1111111111$/,
      /^0000000000$/,
      /^9999999999$/,
      /^123456789012[37]$/,
      /^1234567890123$/,
      /^(123456|654321)/,
    ];

    for (const pattern of fakePatterns) {
      if (pattern.test(nid)) {
        setNidWarning(
          "⚠️ This appears to be a fake NID. Please use your real NID card number.",
        );
        setNidVerified(false);
        return;
      }
    }

    // Check valid format
    const nidPattern = /^(\d{10}|\d{13}|\d{17})$/;
    if (nid.length >= 10 && !nidPattern.test(nid)) {
      setNidWarning("Invalid format. Must be 10, 13, or 17 digits.");
    } else {
      setNidWarning("");
    }
  };

  const handleNIDChange = (text: string) => {
    setNidNumber(text);
    setNidVerified(false);
    checkNIDPattern(text);
  };

  const pickNIDImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload NID",
        );
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
        setNidVerified(false);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadNIDViaBackend = async (uri: string): Promise<string | null> => {
    try {
      let base64Image = "";

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix if present
            resolve(base64.includes(",") ? base64.split(",")[1] : base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
      }

      const response = await fetch(`${API_BASE_URL}/nid/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: `data:image/jpeg;base64,${base64Image}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        return null;
      }

      const result = await response.json();
      if (!result?.publicUrl) {
        console.error("Upload response missing publicUrl", result);
        return null;
      }

      return result.publicUrl as string;
    } catch (error) {
      console.error("NID upload error:", error);
      return null;
    }
  };

  const handleNIDVerification = async (): Promise<boolean> => {
    console.log("🔍 Starting NID verification...");
    console.log("NID Number:", nidNumber);
    console.log("NID Image:", nidImage ? "Selected" : "Not selected");

    if (!nidNumber.trim()) {
      console.log("❌ Validation failed: No NID number");
      Alert.alert("Required", "Please enter your NID number");
      return false;
    }

    const fakePatterns = [
      /^1234567890$/,
      /^123456789010$/,
      /^1111111111$/,
      /^0000000000$/,
      /^9999999999$/,
      /^123456789012[37]$/,
      /^1234567890123$/,
      /^(123456|654321)/,
    ];

    for (const pattern of fakePatterns) {
      if (pattern.test(nidNumber.trim())) {
        console.log("❌ Validation failed: Fake NID pattern detected");
        Alert.alert(
          "⚠️ Invalid NID",
          "This appears to be a test or fake NID number. Please enter your actual NID from your official card.",
          [{ text: "OK" }],
        );
        setNidVerified(false);
        return false;
      }
    }

    const nidPattern = /^(\d{10}|\d{13}|\d{17})$/;
    if (!nidPattern.test(nidNumber.trim())) {
      console.log("❌ Validation failed: Invalid NID format");
      Alert.alert(
        "Invalid NID Format",
        "Bangladesh NID must be exactly 10, 13, or 17 digits",
      );
      return false;
    }

    if (!nidImage) {
      console.log("❌ Validation failed: No NID image");
      Alert.alert("Required", "Please upload your NID card image");
      return false;
    }

    console.log("✅ All validations passed, starting upload...");
    setIsVerifying(true);

    try {
      console.log("📤 Uploading NID image via backend...");
      const uploadedUrl = await uploadNIDViaBackend(nidImage);

      if (!uploadedUrl) {
        console.log("❌ Upload failed");
        Alert.alert(
          "Upload Failed",
          "Failed to upload NID image. Please try again.",
        );
        return false;
      }

      setNidImageUrl(uploadedUrl);
      console.log("✅ NID image uploaded successfully:", uploadedUrl);

      console.log("📡 Calling backend OCR API...");
      const extractResponse = await fetch(`${API_BASE_URL}/nid/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: uploadedUrl }),
      });

      console.log("📥 Backend response status:", extractResponse.status);

      if (!extractResponse.ok) {
        console.log(
          "❌ Backend returned error status:",
          extractResponse.status,
        );
        throw new Error(`Backend error: ${extractResponse.status}`);
      }

      const extractData = await extractResponse.json();
      console.log(
        "📄 OCR extraction result:",
        JSON.stringify(extractData, null, 2),
      );

      if (!extractData.success || !extractData.nidNumber) {
        console.log("❌ OCR extraction failed or no NID found");
        Alert.alert(
          "❌ Verification Failed",
          "Could not extract NID from image. Please ensure:\n• Image is clear and well-lit\n• NID card is fully visible\n• Text is readable",
          [{ text: "Try Again" }],
        );
        return false;
      }

      const extractedNID = extractData.nidNumber.trim();
      const enteredNID = nidNumber.trim();

      console.log("🔍 Comparing NIDs:");
      console.log("  Entered:", enteredNID);
      console.log("  Extracted:", extractedNID);
      console.log("  Match:", extractedNID === enteredNID);

      if (extractedNID === enteredNID) {
        console.log("✅ NID verification successful - numbers match!");
        setNidVerified(true);
        Alert.alert(
          "✅ NID Verified Successfully!",
          `Your NID has been verified.\n\nEntered: ${enteredNID}\nExtracted: ${extractedNID}`,
          [{ text: "Continue" }],
        );
        return true;
      }

      console.log("❌ NID verification failed - numbers don't match!");
      setNidVerified(false);
      Alert.alert(
        "❌ NID Mismatch",
        `The NID number in your image doesn't match what you entered.\n\nYou entered: ${enteredNID}\nImage shows: ${extractedNID}\n\nPlease check and try again.`,
        [{ text: "OK" }],
      );
      return false;
    } catch (error: any) {
      console.error("❌ Verification error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert(
        "Network Error",
        `Failed to verify NID. Please check:\n\n• Backend is running on port 5001\n• Your internet connection\n• You're using an Android emulator (use 10.0.2.2 instead of localhost)\n\nError: ${error.message}`,
        [{ text: "OK" }],
      );
      return false;
    } finally {
      console.log("🏁 Verification process completed");
      setIsVerifying(false);
    }
  };

  const handleNext = async () => {
    if (step === "details") {
      if (!fullName.trim()) {
        Alert.alert("Required", "Please enter your full name");
        return;
      }
      if (!dateOfBirth.trim()) {
        Alert.alert("Required", "Please enter your date of birth");
        return;
      }
      if (!phone.trim()) {
        Alert.alert("Required", "Please enter your phone number");
        return;
      }
      if (!email.trim()) {
        Alert.alert("Required", "Please enter your email address");
        return;
      }
      setStep("nid");
    } else if (step === "nid") {
      if (!nidVerified) {
        const verified = await handleNIDVerification();
        if (!verified) {
          return;
        }
      }
      setStep("expertise");
    }
  };

  const handleSubmit = async () => {
    console.log("�🔥🔥 BUTTON CLICKED! handleSubmit function started!");
    console.log("🚀 Submit button clicked!");

    // Check user authentication first
    if (!user) {
      console.log("❌ User not logged in - showing auth alert");
      Alert.alert(
        "Authentication Required",
        "You must be logged in to register as a guide. Please log in first.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Login", onPress: () => router.push("/login") },
        ],
      );
      return;
    }

    console.log("✅ User authenticated:", user.email);
    console.log("Form data:", {
      fullName,
      dateOfBirth,
      phone,
      email,
      nidNumber,
      expertiseCount: selectedExpertiseCategories.length,
      coverageCount: coverageAreas.length,
      perHourRate,
      yearsExperience,
    });

    // Enhanced validation
    console.log("🔍 Starting field validation...");

    if (!fullName.trim()) {
      console.warn("❌ Validation FAILED: fullName is empty");
      Alert.alert("Required Field", "Please enter your full name");
      return;
    }
    console.log("✅ fullName validation passed");

    if (!dateOfBirth.trim()) {
      console.warn("❌ Validation FAILED: dateOfBirth is empty");
      Alert.alert("Required", "Please enter your date of birth");
      return;
    }
    console.log("✅ dateOfBirth validation passed");

    if (!phone.trim()) {
      console.warn("❌ Validation FAILED: phone is empty");
      Alert.alert("Required", "Please enter your phone number");
      return;
    }
    console.log("✅ phone basic validation passed");

    if (!email.trim()) {
      console.warn("❌ Validation FAILED: email is empty");
      Alert.alert("Required", "Please enter your email address");
      return;
    }
    console.log("✅ email basic validation passed");

    if (!nidNumber.trim()) {
      console.warn("❌ Validation FAILED: nidNumber is empty");
      Alert.alert("Required", "Please enter your NID number");
      return;
    }
    console.log("✅ nidNumber validation passed");

    if (selectedExpertiseCategories.length === 0) {
      console.warn("❌ Validation FAILED: no expertise categories selected");
      Alert.alert(
        "Required Field Missing",
        "Please scroll down and select at least one area of expertise (e.g., Historical Sites, Cultural Tours, etc.)",
      );
      return;
    }
    console.log("✅ expertiseCategories validation passed");

    if (coverageAreas.length === 0) {
      console.warn("❌ Validation FAILED: no coverage areas selected");
      Alert.alert(
        "Required Field Missing",
        "Please scroll down and select at least one coverage area (district) where you can provide services",
      );
      return;
    }
    console.log("✅ coverageAreas validation passed");

    if (
      !perHourRate.trim() ||
      isNaN(Number(perHourRate)) ||
      Number(perHourRate) <= 0
    ) {
      console.warn("❌ Validation FAILED: invalid perHourRate", {
        perHourRate,
        isNum: isNaN(Number(perHourRate)),
        value: Number(perHourRate),
      });
      Alert.alert(
        "Required Field Missing",
        "Please scroll down and enter your per hour rate in BDT",
      );
      return;
    }
    console.log("✅ perHourRate validation passed");

    if (!yearsExperience.trim()) {
      Alert.alert("Required", "Please enter your years of experience");
      return;
    }

    // Validate phone number format
    console.log("📞 Validating phone number:", phone);
    console.log("📞 Phone format check regex: /^\\+880\\d{9,10}$/");
    console.log(
      "📞 Phone matches format?",
      phone.match(/^\+880\d{9,10}$/) ? "YES" : "NO",
    );

    if (!phone.match(/^\+880\d{9,10}$/)) {
      console.warn("❌ Phone validation FAILED - showing alert");
      Alert.alert(
        "Validation Error",
        "Please enter a valid Bangladesh phone number (e.g., +880XXXXXXXXX)",
      );
      return;
    }
    console.log("✅ Phone validation PASSED");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log(
      "📧 email format check regex: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/",
    );
    console.log(
      "📧 email:",
      email,
      "matches?",
      emailRegex.test(email) ? "YES" : "NO",
    );
    if (!emailRegex.test(email)) {
      console.warn("❌ Validation FAILED: invalid email format");
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }
    console.log("✅ email format validation PASSED");

    console.log("🎉 ALL VALIDATIONS PASSED! Proceeding to API call...");

    setIsSubmitting(true);

    try {
      // Calculate age from date of birth
      const birthDate = new Date(dateOfBirth.split("/").reverse().join("-"));
      const today = new Date();
      const calculatedAge = Math.floor(
        (today.getTime() - birthDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      );

      if (isNaN(calculatedAge) || calculatedAge < 18 || calculatedAge > 120) {
        Alert.alert(
          "Validation Error",
          "Please enter a valid date of birth. You must be between 18 and 120 years old.",
        );
        setIsSubmitting(false);
        return;
      }

      // Format date of birth for database (YYYY-MM-DD)
      const formattedDOB = dateOfBirth.split("/").reverse().join("-");

      // Create guide profile data for Backend API
      const guideData = {
        firstName: fullName.split(" ")[0] || fullName,
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        nidNumber: nidNumber.trim(),
        nidImageUrl: nidImageUrl || "pending_upload",
        age: calculatedAge,
        dateOfBirth: formattedDOB,
        expertiseArea: selectedExpertiseCategories[0] || "Tourism",
        specialties: selectedExpertiseCategories,
        selectedExpertiseCategories: selectedExpertiseCategories,
        coverageAreas: coverageAreas,
        perHourRate: parseFloat(perHourRate),
        yearsOfExperience: parseInt(yearsExperience) || 1,
        bio:
          experience ||
          `Experienced guide specializing in ${selectedExpertiseCategories.join(
            ", ",
          )}. Available in ${coverageAreas.slice(0, 3).join(", ")}${
            coverageAreas.length > 3 ? " and more areas" : ""
          }.`,
        languages: ["Bengali", "English"],
        certifications: [],
      };

      console.log("📤 Submitting guide data to Backend API...");
      console.log(
        "📦 Full Guide Data Object:",
        JSON.stringify(guideData, null, 2),
      );
      console.log("📋 Data Summary:", {
        firstName: guideData.firstName,
        lastName: guideData.lastName,
        email: guideData.email,
        phone: guideData.phone,
        perHourRate: guideData.perHourRate,
        expertiseCount: guideData.selectedExpertiseCategories.length,
        coverageCount: guideData.coverageAreas.length,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error("❌ No access token found in session");
        throw new Error("You must be logged in to register (Session Expired)");
      }
      console.log("✅ Got auth token (Supabase), length:", token.length);

      // Test backend connectivity first
      console.log("🔍 Testing backend connectivity...");
      console.log("🌐 Testing URL:", `${API_BASE_URL}/guides`);
      try {
        const testResponse = await fetch(`${API_BASE_URL}/guides`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("✅ Backend is reachable, status:", testResponse.status);
        const testData = await testResponse.text();
        console.log("✅ Backend response sample:", testData.substring(0, 100));
      } catch (testError) {
        console.error("❌ Backend connectivity test failed:", testError);
        throw new Error(
          "Cannot connect to server. Please check your internet connection and try again.",
        );
      }

      // Call Backend API instead of direct Supabase insert
      console.log("📡 Calling registerGuide API...");
      console.log(
        "📤 Sending POST request to:",
        `${API_BASE_URL}/guides/register`,
      );
      console.log("📦 Request payload:", guideData);

      let data;
      try {
        data = await registerGuide(guideData, token);
        console.log("✅ Guide registered successfully via API:", data);
      } catch (apiError: any) {
        console.error("🚨 API call failed immediately:");
        console.error("Error:", apiError);
        console.error("Message:", apiError?.message);
        throw apiError;
      }

      // Show verification notice and auto-redirect home
      if (Platform.OS === "web") {
        window.alert(
          "We Are Verifying Now\n\nThank you for registering! We are verifying your details now.",
        );
      } else {
        Alert.alert(
          "We Are Verifying Now",
          "Thank you for registering! We are verifying your details now.",
        );
      }

      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Guide registration error caught!");
      console.error("Error type:", typeof error);
      console.error("Error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Full error JSON:", JSON.stringify(error, null, 2));

      let errorMessage = "Please check your internet connection and try again.";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.toString && typeof error.toString === "function") {
        errorMessage = error.toString();
      }

      console.error("📢 Showing error alert with message:", errorMessage);

      if (Platform.OS === "web") {
        window.alert(
          `Sorry, Please Check Again\n\nError: ${errorMessage}\n\nPlease give us your right details.`,
        );
      } else {
        Alert.alert(
          "Sorry, Please Check Again",
          `Error: ${errorMessage}\n\nPlease give us your right details.`,
          [{ text: "OK" }],
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Phone Number */}
            <View style={styles.fieldWrapper}>
              <Label icon="call" label="Phone Number" required />
              <TextInput
                style={styles.input}
                placeholder="+880 1XXXXXXXXX"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Label icon="mail" label="Email Address" required />
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
                style={[styles.input, nidWarning ? styles.inputError : null]}
                placeholder="Enter your NID number"
                placeholderTextColor="#999"
                value={nidNumber}
                onChangeText={handleNIDChange}
                keyboardType="numeric"
                maxLength={17}
              />
              {nidWarning ? (
                <Text style={styles.errorText}>{nidWarning}</Text>
              ) : (
                <Text style={styles.helperText}>
                  Bangladesh NID format: typically 10-17 digits
                </Text>
              )}
            </View>

            {/* NID Card Image Upload */}
            <View style={styles.fieldWrapper}>
              <Label icon="camera" label="NID Card Image" required />
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickNIDImage}
              >
                {nidImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: nidImage }}
                      style={styles.imagePreview}
                    />
                    <View style={styles.changeImageOverlay}>
                      <Ionicons name="camera" size={32} color="#fff" />
                      <Text style={styles.changeImageText}>Change Image</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={48}
                      color={Colors.primary}
                    />
                    <Text style={styles.uploadText}>Upload NID Card</Text>
                    <Text style={styles.uploadSubtext}>
                      Tap to select image from gallery
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Clear photo of your NID card (front side)
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
                style={[
                  styles.verifyButton,
                  (nidWarning ||
                    !nidNumber.trim() ||
                    !nidImage ||
                    isVerifying) &&
                    styles.verifyButtonDisabled,
                ]}
                onPress={handleNIDVerification}
                disabled={
                  !!nidWarning || !nidNumber.trim() || !nidImage || isVerifying
                }
              >
                {isVerifying ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                    <Text style={styles.verifyButtonText}>Verify NID</Text>
                  </>
                )}
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

        {/* Step 3: Expertise & Areas */}
        {step === "expertise" && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Expertise & Areas</Text>
            <Text style={styles.stepDescription}>
              Share your knowledge and areas you can serve to attract travelers.
            </Text>

            {/* Area Based Expertise */}
            <View style={styles.fieldWrapper}>
              <Label icon="school" label="Area Based Expertise" required />
              <Text style={styles.helperText}>
                Select your areas of expertise (you can select multiple)
              </Text>

              <View style={styles.checkboxGrid}>
                {expertiseCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.checkboxItem,
                      selectedExpertiseCategories.includes(category) &&
                        styles.checkboxItemSelected,
                    ]}
                    onPress={() => {
                      if (selectedExpertiseCategories.includes(category)) {
                        setSelectedExpertiseCategories(
                          selectedExpertiseCategories.filter(
                            (cat) => cat !== category,
                          ),
                        );
                      } else {
                        setSelectedExpertiseCategories([
                          ...selectedExpertiseCategories,
                          category,
                        ]);
                      }
                    }}
                  >
                    <Ionicons
                      name={
                        selectedExpertiseCategories.includes(category)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={20}
                      color={
                        selectedExpertiseCategories.includes(category)
                          ? "#3B82F6"
                          : "#666"
                      }
                    />
                    <Text
                      style={[
                        styles.checkboxText,
                        selectedExpertiseCategories.includes(category) &&
                          styles.checkboxTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Coverage Areas */}
            <View style={styles.fieldWrapper}>
              <Label
                icon="location"
                label="Which areas can you cover?"
                required
              />
              <Text style={styles.helperText}>
                Select districts you can provide services in
              </Text>

              <ScrollView
                style={styles.districtContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.checkboxGrid}>
                  {bangladeshDistricts.map((district) => (
                    <TouchableOpacity
                      key={district}
                      style={[
                        styles.checkboxItem,
                        coverageAreas.includes(district) &&
                          styles.checkboxItemSelected,
                      ]}
                      onPress={() => {
                        if (coverageAreas.includes(district)) {
                          setCoverageAreas(
                            coverageAreas.filter((area) => area !== district),
                          );
                        } else {
                          setCoverageAreas([...coverageAreas, district]);
                        }
                      }}
                    >
                      <Ionicons
                        name={
                          coverageAreas.includes(district)
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={16}
                        color={
                          coverageAreas.includes(district) ? "#3B82F6" : "#666"
                        }
                      />
                      <Text
                        style={[
                          styles.checkboxText,
                          styles.districtText,
                          coverageAreas.includes(district) &&
                            styles.checkboxTextSelected,
                        ]}
                      >
                        {district}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Per Hour Rate */}
            <View style={styles.fieldWrapper}>
              <Label icon="card" label="Per Hour Rate (BDT)" required />
              <TextInput
                style={styles.input}
                placeholder="e.g., 500"
                placeholderTextColor="#999"
                value={perHourRate}
                onChangeText={setPerHourRate}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                Your hourly service rate in Bangladeshi Taka
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
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBack}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {step === "expertise" ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1 },
              isSubmitting && { opacity: 0.6 },
            ]}
            onPress={() => {
              console.log("💥 TouchableOpacity onPress fired!");
              handleSubmit();
            }}
            onPressIn={() => console.log("👆 Button press detected!")}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.primaryButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>
                  Submit Registration
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { flex: 1 }]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {step === "nid" && nidVerified ? "Continue" : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
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
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  imagePickerButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    overflow: "hidden",
    marginTop: 8,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#F0F9FF",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 220,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  changeImageText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
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
  verifyButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
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
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 8,
    minWidth: "45%",
  },
  checkboxItemSelected: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  checkboxText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  checkboxTextSelected: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  districtContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Radii.md,
    backgroundColor: "#F9FAFB",
    padding: 8,
  },
  districtText: {
    fontSize: 12,
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

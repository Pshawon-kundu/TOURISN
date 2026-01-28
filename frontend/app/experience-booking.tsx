import { Colors } from "@/constants/design";
import { experiences } from "@/constants/experiencesData";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// API Base URL
const getApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5001/api";
  }
  return "http://localhost:5001/api";
};

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
}

export default function ExperienceBookingScreen() {
  const { id } = useLocalSearchParams();
  const experience = experiences.find((e) => e.id === id);

  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>("");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Get additional profile data from users table
          const { data: profileData } = await supabase
            .from("users")
            .select("id, email, full_name, phone")
            .eq("id", user.id)
            .single();

          setUserProfile({
            id: user.id,
            email: user.email || "",
            full_name:
              profileData?.full_name ||
              user.user_metadata?.full_name ||
              "Guest User",
            phone: profileData?.phone || user.phone || "+880 1712 000000",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text>Experience not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "blue" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = experience.price * guests;

  const handleBooking = async () => {
    // Validate user profile before booking
    if (!userProfile?.id) {
      if (Platform.OS === "web") {
        window.alert("Please login to continue with booking");
      } else {
        Alert.alert("Login Required", "Please login to complete your booking", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => router.push("/login"),
          },
        ]);
      }
      return;
    }

    setLoading(true);

    try {
      // Calculate dates for multi-day experiences
      const startDate = new Date();
      const durationDays = parseInt(experience.duration) || 1;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Prepare comprehensive booking data for backend API
      const bookingData = {
        // User info from authenticated profile
        userId: userProfile.id,
        travelerName: userProfile.full_name || "Guest User",
        travelerEmail: userProfile.email,
        travelerPhone: userProfile.phone || "+880 1712 000000",

        // Experience details
        experienceId: experience.id,
        experienceName: experience.name,
        experienceCategory: experience.category,
        experienceLocation: experience.location,
        experienceDuration: experience.duration,
        experiencePrice: experience.price * guests,

        // Guide details
        guideId: experience.guide?.id || null,
        guideName: experience.guide?.name || "Local Guide",
        guideRatePerHour: 500, // Default rate
        guideHours: parseInt(experience.duration) * 8 || 8, // 8 hours per day

        // Travel details
        numberOfTravelers: guests,
        travelDate: startDate.toISOString().split("T")[0],
        checkInDate: startDate.toISOString().split("T")[0],
        checkOutDate: endDate.toISOString().split("T")[0],

        // Additional info
        specialRequests: `${experience.name} - ${guests} guests`,

        // Payment
        paymentMethod: "card",
      };

      console.log("📡 Sending experience booking to backend:", bookingData);

      // Call backend API to save to Supabase
      const response = await fetch(`${getApiBaseUrl()}/combined-bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Experience booking saved to Supabase:", result.data);

        // Set the booking reference from backend
        const reference = result.data?.bookingReference || `TUR-${Date.now()}`;
        setBookingReference(reference);

        // Also save booking ID for reference
        const bookingId = result.data?.experienceBooking?.id;
        console.log("📝 Booking ID:", bookingId);
        console.log("📝 Booking Reference:", reference);
        console.log("👤 User ID:", userProfile.id);
        console.log("👤 User Name:", userProfile.full_name);
        console.log("📧 User Email:", userProfile.email);

        setShowThankYou(true);
      } else {
        throw new Error(result.error || "Booking failed");
      }
    } catch (error) {
      console.error("❌ Experience booking error:", error);

      // Show error to user
      if (Platform.OS === "web") {
        window.alert("Booking failed. Please try again.");
      } else {
        Alert.alert(
          "Booking Failed",
          "Unable to complete your booking. Please try again.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
    router.navigate("/(tabs)/experiences");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Experience Summary */}
        <View style={styles.card}>
          <Image source={{ uri: experience.image }} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.expTitle}>{experience.name}</Text>
            <View style={styles.row}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.expLocation}>{experience.location}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.expLocation}>{experience.duration}</Text>
            </View>
          </View>
        </View>

        {/* Guide & Hotel Details */}
        <Text style={styles.sectionTitle}>Key Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Your Guide</Text>
              <Text style={styles.detailValue}>{experience.guide.name}</Text>
              <Text style={styles.detailSub}>
                Certified • {experience.guide.experience} Years Exp
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Contact Number</Text>
              <Text style={styles.detailValue}>+880 1712 000000</Text>
              <Text style={styles.detailSub}>Available 24/7 for guests</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="bed" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Accommodation / Meeting</Text>
              <Text style={styles.detailValue}>
                {experience.duration.includes("day")
                  ? "Hotel Seagull / Similar (3 Star)"
                  : experience.meetingPoint}
              </Text>
              <Text style={styles.detailSub}>
                {experience.duration.includes("day")
                  ? "Breakfast Included"
                  : "Please arrive 15 mins early"}
              </Text>
            </View>
          </View>
        </View>

        {/* Guest Select */}
        <Text style={styles.sectionTitle}>Guests</Text>
        <View style={styles.guestControl}>
          <View>
            <Text style={styles.guestLabel}>Number of People</Text>
            <Text style={styles.guestSub}>
              Max {experience.maxParticipants} people
            </Text>
          </View>
          <View style={styles.counter}>
            <TouchableOpacity
              style={[
                styles.counterBtn,
                guests <= 1 && styles.counterBtnDisabled,
              ]}
              onPress={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={guests <= 1 ? "#ccc" : "#000"}
              />
            </TouchableOpacity>
            <Text style={styles.countText}>{guests}</Text>
            <TouchableOpacity
              style={[
                styles.counterBtn,
                guests >= experience.maxParticipants &&
                  styles.counterBtnDisabled,
              ]}
              onPress={() =>
                setGuests(Math.min(experience.maxParticipants, guests + 1))
              }
              disabled={guests >= experience.maxParticipants}
            >
              <Ionicons
                name="add"
                size={20}
                color={guests >= experience.maxParticipants ? "#ccc" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            {totalPrice.toLocaleString()} {experience.currency}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleBooking}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseThankYou}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Thank You!</Text>
            <Text style={styles.modalText}>
              Your booking has been confirmed successfully.
            </Text>
            {bookingReference && (
              <View style={styles.referenceContainer}>
                <Text style={styles.referenceLabel}>Booking Reference</Text>
                <Text style={styles.referenceNumber}>{bookingReference}</Text>
              </View>
            )}
            <Text style={styles.modalSubtext}>
              {userProfile?.full_name ? `Hi ${userProfile.full_name}, ` : ""}
              We have sent a confirmation to{" "}
              {userProfile?.email || "your email"}.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseThankYou}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  expLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    marginTop: 8,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  detailSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  guestControl: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guestLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  guestSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  countText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    minWidth: 20,
    textAlign: "center",
  },
  footerSpacer: {
    height: 40,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  referenceContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  referenceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  referenceNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1,
  },
  modalSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

import { Colors, Radii, Spacing } from "@/constants/design";
import { experiences } from "@/constants/experiencesData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const experience = experiences.find((exp) => exp.id === id);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Experience not found</Text>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "moderate":
        return "#F59E0B";
      case "challenging":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${String(i).padStart(2, "0")}:00`);
      if (i < 18) slots.push(`${String(i).padStart(2, "0")}:30`);
    }
    return slots;
  };

  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getPricingMultiplier = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    // Peak hours (9-11 AM, 4-6 PM) = 1.25x
    // Normal hours (8 AM, 12-3 PM) = 1x
    // Off-peak hours (5:30-6:30 PM) = 0.9x
    if ((hour >= 9 && hour <= 11) || (hour >= 16 && hour <= 17)) {
      return 1.25;
    } else if (hour === 18) {
      return 0.9;
    }
    return 1.0;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  const calculateDynamicPrice = () => {
    const basePrice = experience.price;
    const multiplier = getPricingMultiplier(selectedTime);
    return Math.round(basePrice * multiplier * quantity);
  };

  const handleBookNow = () => {
    setShowThankYou(true);
  };

  const handleMessageGuide = () => {
    // Navigate to chat with the guide
    router.push({
      pathname: "/chat-room",
      params: {
        guideId: experience.id, // Use experience ID as guide identifier
        guideName: experience.guide.name,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{experience.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <Image source={{ uri: experience.image }} style={styles.image} />

        {/* Title & Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{experience.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD34D" />
            <Text style={styles.rating}>{experience.rating}</Text>
            <Text style={styles.reviews}>({experience.reviews} reviews)</Text>
          </View>
        </View>

        {/* Quick Info Boxes */}
        <View style={styles.infoBoxes}>
          <View style={styles.infoBox}>
            <Ionicons name="location" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Location</Text>
            <Text style={styles.infoBoxValue}>{experience.location}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="time" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Duration</Text>
            <Text style={styles.infoBoxValue}>{experience.duration}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="people" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Group Size</Text>
            <Text style={styles.infoBoxValue}>{experience.groupSize}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Experience</Text>
          <Text style={styles.description}>{experience.description}</Text>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {experience.highlights.map((highlight, idx) => (
            <View key={idx} style={styles.listItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.listText}>{highlight}</Text>
            </View>
          ))}
        </View>

        {/* Guide Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Guide</Text>
          <View style={styles.guideCard}>
            <Image
              source={{ uri: experience.guide.avatar }}
              style={styles.guideAvatar}
            />
            <View style={styles.guideDetails}>
              <Text style={styles.guideName}>{experience.guide.name}</Text>
              <Text style={styles.guideLanguages}>
                Languages: {experience.guide.languages.join(", ")}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="star" size={14} color="#FFD34D" />
                <Text style={styles.guideExperience}>
                  {experience.guide.rating} • {experience.guide.experience}{" "}
                  years experience
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>

          {/* Current Time Display */}
          <View style={styles.currentTimeBox}>
            <Ionicons name="time" size={16} color="#2563EB" />
            <Text style={styles.currentTimeLabel}>Current Time:</Text>
            <Text style={styles.currentTimeValue}>{getCurrentTime()}</Text>
          </View>

          {/* Date Selection */}
          <TouchableOpacity
            style={styles.dateTimeBox}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateTimeContent}>
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Preferred Date</Text>
                <Text style={styles.dateTimeValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Time Selection */}
          <TouchableOpacity
            style={styles.dateTimeBox}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.dateTimeContent}>
              <Ionicons name="time-outline" size={20} color="#2563EB" />
              <View style={styles.dateTimeTextContainer}>
                <Text style={styles.dateTimeLabel}>Preferred Time</Text>
                <Text style={styles.dateTimeValue}>{selectedTime}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Pricing Info */}
          <View style={styles.pricingInfoBox}>
            <Ionicons name="information-circle" size={18} color="#2563EB" />
            <View style={styles.pricingInfoContent}>
              <Text style={styles.pricingInfoLabel}>Dynamic Pricing</Text>
              <Text style={styles.pricingInfoText}>
                {getPricingMultiplier(selectedTime) > 1
                  ? "Peak hours (9-11 AM, 4-5 PM): +25% extra charge"
                  : getPricingMultiplier(selectedTime) < 1
                  ? "Off-peak hours (6 PM): -10% discount"
                  : "Normal hours: Standard rate"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.topRow}>
          <View style={styles.quantitySection}>
            <Text style={styles.addPeopleLabel}>Add People</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                quantity < experience.maxParticipants &&
                setQuantity(quantity + 1)
              }
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.priceRow}>
              <Text style={styles.totalPrice}>
                ৳{calculateDynamicPrice().toLocaleString()}
              </Text>
              <View
                style={[
                  styles.priceBadge,
                  {
                    backgroundColor:
                      getPricingMultiplier(selectedTime) > 1
                        ? "#FEE2E2"
                        : getPricingMultiplier(selectedTime) < 1
                        ? "#DBEAFE"
                        : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priceBadgeText,
                    {
                      color:
                        getPricingMultiplier(selectedTime) > 1
                          ? "#DC2626"
                          : getPricingMultiplier(selectedTime) < 1
                          ? "#0284C7"
                          : "#10B981",
                    },
                  ]}
                >
                  {getPricingMultiplier(selectedTime) > 1
                    ? "Peak"
                    : getPricingMultiplier(selectedTime) < 1
                    ? "Off-peak"
                    : "Normal"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleMessageGuide}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#2563EB" />
          <Text style={styles.messageButtonText}>Message Guide</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.dateGrid}
              contentContainerStyle={styles.dateGridContent}
              showsVerticalScrollIndicator={false}
            >
              {getDaysArray().map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dateOption,
                    selectedDate.toDateString() === date.toDateString() &&
                      styles.dateOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dateOptionDay,
                      selectedDate.toDateString() === date.toDateString() &&
                        styles.dateOptionTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <Text
                    style={[
                      styles.dateOptionDate,
                      selectedDate.toDateString() === date.toDateString() &&
                        styles.dateOptionTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.dateOptionMonth,
                      selectedDate.toDateString() === date.toDateString() &&
                        styles.dateOptionTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.timeGrid}
              contentContainerStyle={styles.timeGridContent}
              showsVerticalScrollIndicator={false}
            >
              {generateTimeSlots().map((time, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selectedTime === time && styles.timeOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThankYou(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={40} color="#10B981" />
            </View>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouMessage}>
              Your booking request has been submitted successfully. We&apos;ll
              send you a confirmation shortly.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setShowThankYou(false);
                router.back();
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
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
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
    paddingTop: 50,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.md,
    maxWidth: 200,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl * 3,
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#E5E7EB",
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
  },
  reviews: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoBoxes: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  infoBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoBoxValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  listText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  guideAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  guideDetails: {
    flex: 1,
  },
  guideName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guideLanguages: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  guideExperience: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  addPeopleLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  quantityButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 2,
  },
  priceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  messageButton: {
    backgroundColor: "#fff",
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: Radii.lg,
    padding: Spacing.xxl,
    width: "85%",
    alignItems: "center",
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  thankYouMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  okButton: {
    backgroundColor: "#2563EB",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl * 2,
    borderRadius: Radii.md,
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 100,
  },
  // Date & Time Selection Styles
  currentTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    marginBottom: Spacing.md,
  },
  currentTimeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  currentTimeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  dateTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
    marginBottom: Spacing.md,
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  dateTimeTextContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },
  pricingInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    marginTop: Spacing.md,
  },
  pricingInfoContent: {
    flex: 1,
  },
  pricingInfoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  pricingInfoText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
  },
  // Picker Modals
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    paddingTop: Spacing.lg,
    maxHeight: "80%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  dateGrid: {
    flex: 1,
  },
  dateGridContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dateOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dateOptionSelected: {
    backgroundColor: "#2563EB",
  },
  dateOptionDay: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    width: 50,
  },
  dateOptionDate: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    width: 40,
  },
  dateOptionMonth: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  dateOptionTextSelected: {
    color: "#fff",
  },
  timeGrid: {
    flex: 1,
  },
  timeGridContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  timeOption: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOptionSelected: {
    backgroundColor: "#2563EB",
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  timeOptionTextSelected: {
    color: "#fff",
  },
});

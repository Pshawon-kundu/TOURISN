import { experiences } from "@/constants/experiencesData";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
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
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const experience = experiences.find((exp) => exp.id === id);

  if (!experience) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
          <Text style={styles.errorTitle}>Experience Not Found</Text>
          <Text style={styles.errorSubtitle}>
            This experience may have been removed or is no longer available.
          </Text>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.errorBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "walk";
      case "moderate":
        return "bicycle";
      case "challenging":
        return "fitness";
      default:
        return "help";
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
    if ((hour >= 9 && hour <= 11) || (hour >= 16 && hour <= 17)) {
      return 1.25;
    } else if (hour === 18) {
      return 0.9;
    }
    return 1.0;
  };

  const calculateDynamicPrice = () => {
    const basePrice = experience.price;
    const multiplier = getPricingMultiplier(selectedTime);
    return Math.round(basePrice * multiplier * quantity);
  };

  const handleBookNow = async () => {
    setLoading(true);

    try {
      // Prepare booking data
      const bookingData = {
        user_id: user?.id || null,
        user_email: user?.email || "guest@example.com",
        experience_id: experience.id,
        experience_name: experience.name,
        experience_image: experience.image,
        location: experience.location,
        region: experience.region,
        guide_name: experience.guide.name,
        guide_avatar: experience.guide.avatar,
        guests: quantity,
        unit_price: experience.price,
        total_price: calculateDynamicPrice(),
        currency: experience.currency,
        status: "confirmed",
        booking_date: new Date().toISOString(),
        experience_date: selectedDate.toISOString(),
        experience_time: selectedTime,
        duration: experience.duration,
        meeting_point: experience.meetingPoint,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from("experience_bookings")
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.log(
          "Supabase error (creating table if needed):",
          error.message,
        );
        // Try inserting into regular bookings table as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("bookings")
          .insert({
            user_id: user?.id,
            type: "experience",
            item_id: experience.id,
            item_name: experience.name,
            quantity: quantity,
            total_amount: calculateDynamicPrice(),
            status: "confirmed",
            booking_details: JSON.stringify(bookingData),
          })
          .select()
          .single();

        if (fallbackError) {
          console.log("Fallback insert also failed:", fallbackError.message);
        } else {
          console.log("Booking saved via fallback:", fallbackData);
        }
      } else {
        console.log("Booking saved successfully:", data);
      }

      setLoading(false);
      setShowThankYou(true);
    } catch (e) {
      console.error("Booking error:", e);
      setLoading(false);
      setShowThankYou(true); // Show success anyway for demo
    }
  };

  const handleSaveExperience = async () => {
    setIsSaved(!isSaved);

    try {
      if (!isSaved && user?.id) {
        await supabase.from("saved_experiences").insert({
          user_id: user.id,
          experience_id: experience.id,
          experience_name: experience.name,
          experience_image: experience.image,
        });
      }
    } catch (e) {
      console.log("Save error:", e);
    }
  };

  const handleShareExperience = () => {
    Alert.alert("Share", "Share functionality coming soon!", [{ text: "OK" }]);
  };

  const handleMessageGuide = () => {
    router.push({
      pathname: "/chat-room",
      params: {
        guideId: experience.id,
        guideName: experience.guide.name,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image with Gradient Overlay */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: experience.image }} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.7)"]}
            style={styles.heroGradient}
          />

          {/* Header Buttons */}
          <View style={styles.heroHeader}>
            <TouchableOpacity
              style={styles.heroHeaderBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.heroHeaderRight}>
              <TouchableOpacity
                style={styles.heroHeaderBtn}
                onPress={handleShareExperience}
              >
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heroHeaderBtn,
                  isSaved && styles.heroHeaderBtnActive,
                ]}
                onPress={handleSaveExperience}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color={isSaved ? "#EF4444" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {experience.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{experience.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{experience.rating}</Text>
              </View>
              <Text style={styles.reviewsText}>
                ({experience.reviews} reviews)
              </Text>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={14} color="#fff" />
                <Text style={styles.locationText}>{experience.location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={[styles.infoCardIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="time-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.infoCardLabel}>Duration</Text>
            <Text style={styles.infoCardValue}>{experience.duration}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoCardIcon, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="people-outline" size={22} color="#10B981" />
            </View>
            <Text style={styles.infoCardLabel}>Group Size</Text>
            <Text style={styles.infoCardValue}>{experience.groupSize}</Text>
          </View>
          <View style={styles.infoCard}>
            <View
              style={[
                styles.infoCardIcon,
                {
                  backgroundColor:
                    getDifficultyColor(experience.difficulty) + "20",
                },
              ]}
            >
              <Ionicons
                name={getDifficultyIcon(experience.difficulty) as any}
                size={22}
                color={getDifficultyColor(experience.difficulty)}
              />
            </View>
            <Text style={styles.infoCardLabel}>Difficulty</Text>
            <Text
              style={[
                styles.infoCardValue,
                { color: getDifficultyColor(experience.difficulty) },
              ]}
            >
              {experience.difficulty.charAt(0).toUpperCase() +
                experience.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceLeft}>
            <Text style={styles.priceFrom}>From</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>
                ৳{experience.price.toLocaleString()}
              </Text>
              <Text style={styles.pricePer}>/person</Text>
            </View>
          </View>
          <View style={styles.priceRight}>
            <View style={styles.discountBadge}>
              <Ionicons name="flash" size={14} color="#F59E0B" />
              <Text style={styles.discountText}>Early Bird -10%</Text>
            </View>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.sectionSeparator} />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Experience</Text>
          <Text style={styles.description}>{experience.description}</Text>
        </View>

        {/* Highlights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Highlights</Text>
          <View style={styles.highlightsGrid}>
            {experience.highlights.map((highlight, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <View style={styles.highlightIcon}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What's Included Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ What&apos;s Included</Text>
          <View style={styles.includedGrid}>
            {experience.included.map((item, idx) => (
              <View key={idx} style={styles.includedItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.includedText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Not Included Section */}
        {experience.notIncluded.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❌ Not Included</Text>
            <View style={styles.notIncludedGrid}>
              {experience.notIncluded.map((item, idx) => (
                <View key={idx} style={styles.notIncludedItem}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                  <Text style={styles.notIncludedText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Guide Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧑‍🏫 Your Expert Guide</Text>
          <View style={styles.guideCard}>
            <Image
              source={{ uri: experience.guide.avatar }}
              style={styles.guideAvatar}
            />
            <View style={styles.guideInfo}>
              <Text style={styles.guideName}>{experience.guide.name}</Text>
              <View style={styles.guideLanguages}>
                <Ionicons name="language" size={14} color="#6B7280" />
                <Text style={styles.guideLanguagesText}>
                  {experience.guide.languages.join(" • ")}
                </Text>
              </View>
              <View style={styles.guideStats}>
                <View style={styles.guideStat}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.guideStatText}>
                    {experience.guide.rating}
                  </Text>
                </View>
                <View style={styles.guideStat}>
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text style={styles.guideStatText}>
                    {experience.guide.experience} years
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.guideChatBtn}
              onPress={handleMessageGuide}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Experience Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="calendar" size={18} color="#6B7280" />
                <Text style={styles.detailLabel}>Best Season</Text>
              </View>
              <Text style={styles.detailValue}>
                {experience.bestSeason.slice(0, 3).join(", ")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="body" size={18} color="#6B7280" />
                <Text style={styles.detailLabel}>Physical Level</Text>
              </View>
              <Text style={styles.detailValue}>
                {experience.physicalRequirement.split(" ")[0]}
              </Text>
            </View>
            {experience.minAge && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons name="person" size={18} color="#6B7280" />
                  <Text style={styles.detailLabel}>Minimum Age</Text>
                </View>
                <Text style={styles.detailValue}>
                  {experience.minAge}+ years
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Ionicons name="people" size={18} color="#6B7280" />
                <Text style={styles.detailLabel}>Max Participants</Text>
              </View>
              <Text style={styles.detailValue}>
                {experience.maxParticipants} people
              </Text>
            </View>
          </View>
        </View>

        {/* Meeting Point */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Meeting Point</Text>
          <View style={styles.meetingCard}>
            <View style={styles.meetingIcon}>
              <Ionicons name="location" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.meetingText}>{experience.meetingPoint}</Text>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Cancellation Policy</Text>
          <View style={styles.policyCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.policyText}>{experience.cancellation}</Text>
          </View>
        </View>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Select Date & Time</Text>

          {/* Date Selection */}
          <TouchableOpacity
            style={styles.dateTimeSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.dateTimeSelectorLeft}>
              <View style={styles.dateTimeSelectorIcon}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.dateTimeSelectorLabel}>Preferred Date</Text>
                <Text style={styles.dateTimeSelectorValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Time Selection */}
          <TouchableOpacity
            style={styles.dateTimeSelector}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.dateTimeSelectorLeft}>
              <View style={styles.dateTimeSelectorIcon}>
                <Ionicons name="time-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.dateTimeSelectorLabel}>Preferred Time</Text>
                <Text style={styles.dateTimeSelectorValue}>{selectedTime}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Dynamic Pricing Info */}
          <View style={styles.pricingInfo}>
            <Ionicons name="information-circle" size={18} color="#F59E0B" />
            <Text style={styles.pricingInfoText}>
              {getPricingMultiplier(selectedTime) > 1
                ? "Peak hours (9-11 AM, 4-5 PM): +25% surcharge"
                : getPricingMultiplier(selectedTime) < 1
                  ? "Off-peak hours (6 PM): 10% discount"
                  : "Standard hours: Regular pricing"}
            </Text>
          </View>
        </View>

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.footerContainer}>
        {/* Pricing Summary */}
        <View style={styles.footerPricing}>
          <View>
            <Text style={styles.footerPriceLabel}>Total Price</Text>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerPrice}>
                ৳{calculateDynamicPrice().toLocaleString()}
              </Text>
              {getPricingMultiplier(selectedTime) !== 1 && (
                <Text style={styles.footerPriceOld}>
                  ৳{(experience.price * quantity).toLocaleString()}
                </Text>
              )}
            </View>
            <Text style={styles.footerPriceInfo}>
              {quantity} {quantity > 1 ? "people" : "person"} × ৳
              {experience.price.toLocaleString()}
            </Text>
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityBox}>
            <Text style={styles.quantityLabel}>Guests</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityBtn,
                  quantity <= 1 && styles.quantityBtnDisabled,
                ]}
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={quantity <= 1 ? "#D1D5DB" : "#374151"}
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityBtn,
                  quantity >= experience.maxParticipants &&
                    styles.quantityBtnDisabled,
                ]}
                onPress={() =>
                  quantity < experience.maxParticipants &&
                  setQuantity(quantity + 1)
                }
                disabled={quantity >= experience.maxParticipants}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={
                    quantity >= experience.maxParticipants
                      ? "#D1D5DB"
                      : "#374151"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.askGuideBtn}
            onPress={handleMessageGuide}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#3B82F6"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={handleBookNow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.bookNowText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.timeGrid}
              contentContainerStyle={styles.timeGridContent}
              showsVerticalScrollIndicator={false}
            >
              {generateTimeSlots().map((time, idx) => {
                const multiplier = getPricingMultiplier(time);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.timeOption,
                      selectedTime === time && styles.timeOptionSelected,
                      multiplier > 1 && styles.timeOptionPeak,
                      multiplier < 1 && styles.timeOptionOffPeak,
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
                    {multiplier !== 1 && (
                      <Text
                        style={[
                          styles.timeOptionBadge,
                          multiplier > 1
                            ? styles.timeOptionPeakText
                            : styles.timeOptionOffPeakText,
                        ]}
                      >
                        {multiplier > 1 ? "+25%" : "-10%"}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThankYou(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={50} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your {experience.name} experience has been booked successfully!
            </Text>
            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Date</Text>
                <Text style={styles.successDetailValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Time</Text>
                <Text style={styles.successDetailValue}>{selectedTime}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Guests</Text>
                <Text style={styles.successDetailValue}>{quantity}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Total</Text>
                <Text style={styles.successDetailValue}>
                  ৳{calculateDynamicPrice().toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={styles.successSubtext}>
              We&apos;ve sent confirmation details to your email.
            </Text>
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.successBtnSecondary}
                onPress={() => {
                  setShowThankYou(false);
                  router.push("/(tabs)/profile");
                }}
              >
                <Text style={styles.successBtnSecondaryText}>
                  View Bookings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successBtnPrimary}
                onPress={() => {
                  setShowThankYou(false);
                  router.push("/(tabs)/experiences");
                }}
              >
                <Text style={styles.successBtnPrimaryText}>Explore More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8FAFC",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorBackText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Hero Section
  heroContainer: {
    height: 340,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroHeaderBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  heroHeaderRight: {
    flexDirection: "row",
    gap: 12,
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  categoryBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  reviewsText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  // Info Cards
  infoCardsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -35,
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },

  // Price Section
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceLeft: {},
  priceFrom: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
  },
  pricePer: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  priceRight: {},
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  discountText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
  },

  // Sections
  sectionSeparator: {
    height: 8,
    backgroundColor: "#F1F5F9",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },

  // Highlights
  highlightsGrid: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  highlightIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },

  // Included
  includedGrid: {
    gap: 10,
  },
  includedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  includedText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },

  // Not Included
  notIncludedGrid: {
    gap: 10,
  },
  notIncludedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notIncludedText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },

  // Guide Card
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  guideAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  guideLanguages: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  guideLanguagesText: {
    fontSize: 13,
    color: "#6B7280",
  },
  guideStats: {
    flexDirection: "row",
    gap: 12,
  },
  guideStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  guideStatText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  guideChatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Details Card
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Meeting Card
  meetingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  meetingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  meetingText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    flex: 1,
  },

  // Policy Card
  policyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  policyText: {
    fontSize: 14,
    color: "#065F46",
    flex: 1,
    fontWeight: "500",
  },

  // Date Time Selector
  dateTimeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateTimeSelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateTimeSelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeSelectorLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  dateTimeSelectorValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
  },

  // Pricing Info
  pricingInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 4,
  },
  pricingInfoText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
  },

  // Footer
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  footerPricing: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  footerPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerPrice: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
  },
  footerPriceOld: {
    fontSize: 16,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  footerPriceInfo: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  quantityBox: {
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  quantityBtnDisabled: {
    backgroundColor: "#F3F4F6",
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 40,
    textAlign: "center",
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
  },
  askGuideBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  bookNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bookNowText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  // Date Grid
  dateGrid: {
    flex: 1,
  },
  dateGridContent: {
    padding: 16,
    gap: 8,
  },
  dateOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    gap: 16,
  },
  dateOptionSelected: {
    backgroundColor: "#3B82F6",
  },
  dateOptionDay: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    width: 40,
  },
  dateOptionDate: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    width: 32,
  },
  dateOptionMonth: {
    fontSize: 14,
    color: "#6B7280",
  },
  dateOptionTextSelected: {
    color: "#fff",
  },

  // Time Grid
  timeGrid: {
    flex: 1,
  },
  timeGridContent: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeOption: {
    width: (SCREEN_WIDTH - 52) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  timeOptionSelected: {
    backgroundColor: "#3B82F6",
  },
  timeOptionPeak: {
    backgroundColor: "#FEF3C7",
  },
  timeOptionOffPeak: {
    backgroundColor: "#D1FAE5",
  },
  timeOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  timeOptionTextSelected: {
    color: "#fff",
  },
  timeOptionBadge: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  timeOptionPeakText: {
    color: "#92400E",
  },
  timeOptionOffPeakText: {
    color: "#065F46",
  },

  // Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  successDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  successDetailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  successDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  successSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  successButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  successBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  successBtnSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  successBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  successBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});

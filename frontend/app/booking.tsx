import { ActionButton } from "@/components/action-button";

import { Header } from "@/components/header";
import { PaymentCard } from "@/components/payment-card";
import { ThemedView } from "@/components/themed-view";
import {
  bangladeshDistricts,
  calculateStayPrice,
  roomQualities,
} from "@/constants/bangladeshDistricts";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { APIClient } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const apiClient = new APIClient();

interface BookingData {
  experienceId?: string;
  date?: string;
  guests?: number;
  totalPrice?: number;
}

export default function BookingScreen() {
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [travelerName, setTravelerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // District and customization states
  const [fromDistrict, setFromDistrict] = useState("Dhaka");
  const [toDistrict, setToDistrict] = useState("Cox's Bazar");
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");
  const [selectingDistrictFor, setSelectingDistrictFor] = useState<
    "from" | "to"
  >("from");

  // Date range states
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState<
    "checkin" | "checkout" | null
  >(null);

  const [personCount, setPersonCount] = useState(2);
  const [selectedQuality, setSelectedQuality] = useState("standard");

  const [step, setStep] = useState<"details" | "payment">("details");
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingData] = useState<BookingData>({});

  // Ref for room quality scroll
  const qualityScrollRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Scroll handler for room quality cards
  const scrollQuality = (direction: "left" | "right") => {
    const cardWidth = 148; // 140px card + 8px margin
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - cardWidth)
        : scrollPosition + cardWidth;

    qualityScrollRef.current?.scrollTo({
      x: newPosition,
      animated: true,
    });
    setScrollPosition(newPosition);
  };

  // Calculate number of nights
  const numberOfNights = Math.max(
    1,
    Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  // Price calculations with nights multiplier
  const basePrice = 1450;
  const pricePerNight = calculateStayPrice(
    basePrice,
    personCount,
    selectedQuality,
  );
  const calculatedPrice = pricePerNight * numberOfNights;
  const taxes = Math.round(calculatedPrice * 0.08);
  const serviceFee = 25;
  const discount = Math.round(calculatedPrice * 0.03);
  const totalAmount = calculatedPrice + taxes + serviceFee - discount;

  const quality = roomQualities.find((q) => q.id === selectedQuality);

  const filteredDistricts = bangladeshDistricts.filter((district) =>
    district.toLowerCase().includes(districtSearchQuery.toLowerCase()),
  );

  // Helper function to generate date options (60 days)
  const generateDateOptions = () => {
    const dates = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 1);

    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDistrictSelect = (district: string) => {
    if (selectingDistrictFor === "from") {
      setFromDistrict(district);
    } else {
      setToDistrict(district);
    }
    setShowDistrictModal(false);
    setDistrictSearchQuery("");
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.email) {
        setEmail(user.email);
        setTravelerName(user.displayName || "");
      }
      try {
        const currentUser = (await apiClient.getCurrentUser()) as any;
        if (currentUser) {
          setTravelerName(
            (currentUser.first_name || "") +
              " " +
              (currentUser.last_name || ""),
          );
          setEmail(currentUser.email || "");
          setPhone(currentUser.phone || "");
        }
      } catch (err) {
        console.log("Could not load user data", err);
      }
    };
    loadUserData();
  }, [user]);

  const validateForm = () => {
    if (!travelerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter valid email");
      return false;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter phone number");
      return false;
    }
    if (step === "payment" && !cardNumber.trim()) {
      Alert.alert("Error", "Please enter card number");
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Prepare robust booking data using current state
    const payload = {
      booking_type: "stay",
      // Use toDistrict as location context
      location: toDistrict,
      // User details
      travelerName,
      phone,
      email,
      notes,

      // Item details
      item_id: `stay_${toDistrict}_${Date.now()}`,
      item_name: `${toDistrict} Stay - ${quality?.label} Room`,

      // Dates
      check_in_date: checkInDate.toISOString(),
      check_out_date: checkOutDate.toISOString(),

      // Quantities
      guests: personCount,
      total_days_or_units: numberOfNights,

      // Financials
      price_per_unit: pricePerNight,
      subtotal: calculatedPrice,
      service_fee: serviceFee,
      total_price: totalAmount,
      currency: "TK",

      // Payment
      payment_method: "card",
      payment_number: cardNumber.slice(-4),
      payment_status: "completed",
      booking_status: "confirmed",
    };

    try {
      // Send to backend and wait for confirmation BEFORE showing success
      console.log("Sending booking payload:", payload);
      await apiClient.request({
        method: "POST",
        endpoint: "/stays",
        body: payload,
      });

      // If successful, show thank you modal
      setLoading(false);
      setShowThankYou(true);
    } catch (error) {
      console.error("Booking error:", error);
      setLoading(false);
      Alert.alert(
        "Booking Failed",
        "Could not save your booking. Please check your connection and try again.",
      );
    }
  };

  const handleGoHome = () => {
    setShowThankYou(false);
    router.push("/(tabs)");
  };

  const handleNext = () => {
    if (!validateForm()) return;

    if (step === "details") {
      setStep("payment");
      return;
    }
    handleConfirm();
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Booking" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepper}>
          <StepPill label="Details" active={step === "details"} index={1} />
          <StepDivider />
          <StepPill label="Payment" active={step === "payment"} index={2} />
        </View>

        {/* Enhanced Location Selector with 64 Bangladesh Districts */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.locationSelector}>
            <TouchableOpacity
              style={styles.districtBox}
              onPress={() => {
                setSelectingDistrictFor("from");
                setShowDistrictModal(true);
              }}
            >
              <View style={styles.districtHeader}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={styles.districtLabel}>From</Text>
              </View>
              <Text style={styles.districtValue}>{fromDistrict}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.swapIconContainer}>
              <TouchableOpacity
                style={styles.swapIcon}
                onPress={() => {
                  // Swap From and To districts
                  const temp = fromDistrict;
                  setFromDistrict(toDistrict);
                  setToDistrict(temp);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.districtBox}
              onPress={() => {
                setSelectingDistrictFor("to");
                setShowDistrictModal(true);
              }}
            >
              <View style={styles.districtHeader}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={styles.districtLabel}>To</Text>
              </View>
              <Text style={styles.districtValue}>{toDistrict}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Date Selection */}
          <View style={{ gap: Spacing.md }}>
            <View style={styles.dateSelectionRow}>
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowDatePicker("checkin")}
              >
                <View style={styles.dateHeader}>
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                  <Text style={styles.dateLabel}>Check-in</Text>
                </View>
                <Text style={styles.dateValue}>
                  {checkInDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              <View style={styles.nightsBadge}>
                <Text style={styles.nightsCount}>{numberOfNights}</Text>
                <Text style={styles.nightsLabel}>
                  {numberOfNights === 1 ? "night" : "nights"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setShowDatePicker("checkout")}
              >
                <View style={styles.dateHeader}>
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                  <Text style={styles.dateLabel}>Check-out</Text>
                </View>
                <Text style={styles.dateValue}>
                  {checkOutDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            <Modal
              visible={showDatePicker !== null}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(null)}
            >
              <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerContent}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                      <Ionicons name="close" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>
                      {showDatePicker === "checkin"
                        ? "Check-in Date"
                        : "Check-out Date"}
                    </Text>
                    <View style={{ width: 28 }} />
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.calendarGrid}>
                      {generateDateOptions().map((date, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.calendarDate,
                            (showDatePicker === "checkin"
                              ? date.toDateString() ===
                                checkInDate.toDateString()
                              : date.toDateString() ===
                                checkOutDate.toDateString()) &&
                              styles.calendarDateSelected,
                          ]}
                          onPress={() => {
                            if (showDatePicker === "checkin") {
                              setCheckInDate(date);
                            } else {
                              if (date >= checkInDate) {
                                setCheckOutDate(date);
                              }
                            }
                            setShowDatePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.calendarDateText,
                              (showDatePicker === "checkin"
                                ? date.toDateString() ===
                                  checkInDate.toDateString()
                                : date.toDateString() ===
                                  checkOutDate.toDateString()) &&
                                styles.calendarDateTextSelected,
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                          <Text style={styles.calendarDateMonth}>
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.tripInfo}>
            <View style={styles.tripInfoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.tripInfoText}>
                {numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"}
              </Text>
            </View>
            <View style={styles.tripInfoItem}>
              <Ionicons name="cash" size={16} color={Colors.primary} />
              <Text
                style={[
                  styles.tripInfoText,
                  { color: Colors.primary, fontWeight: "700" },
                ]}
              >
                {pricePerNight.toLocaleString()} TK/night
              </Text>
            </View>
          </View>
        </View>

        {/* Person Counter & Room Quality Selector */}
        {step === "details" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customize your stay</Text>

            {/* Person Counter (1-10) */}
            <View style={styles.customizeRow}>
              <View style={styles.customizeLabel}>
                <View style={styles.iconBadge}>
                  <Ionicons name="people" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.customizeLabelText}>
                    Number of persons
                  </Text>
                  <Text style={styles.customizeSubtext}>Max 10 people</Text>
                </View>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setPersonCount(Math.max(1, personCount - 1))}
                  disabled={personCount <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove-circle"
                    size={32}
                    color={personCount <= 1 ? Colors.textMuted : Colors.primary}
                  />
                </TouchableOpacity>
                <View style={styles.counterValueContainer}>
                  <Text style={styles.counterValue}>{personCount}</Text>
                  <Text style={styles.counterLabel}>
                    {personCount === 1 ? "person" : "people"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setPersonCount(Math.min(10, personCount + 1))}
                  disabled={personCount >= 10}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add-circle"
                    size={32}
                    color={
                      personCount >= 10 ? Colors.textMuted : Colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Room Quality Selector */}
            <View style={styles.qualitySection}>
              <View style={styles.qualityHeader}>
                <Text style={styles.qualitySectionLabel}>Room quality</Text>
                <View style={styles.qualityArrows}>
                  <TouchableOpacity
                    style={styles.arrowButton}
                    onPress={() => scrollQuality("left")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowButton}
                    onPress={() => scrollQuality("right")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                ref={qualityScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  setScrollPosition(event.nativeEvent.contentOffset.x);
                }}
                scrollEventThrottle={16}
              >
                {roomQualities.map((quality) => (
                  <TouchableOpacity
                    key={quality.id}
                    style={[
                      styles.qualityCard,
                      selectedQuality === quality.id &&
                        styles.qualityCardActive,
                    ]}
                    onPress={() => setSelectedQuality(quality.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={quality.icon as any}
                      size={28}
                      color={
                        selectedQuality === quality.id
                          ? Colors.primary
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.qualityCardLabel,
                        selectedQuality === quality.id &&
                          styles.qualityCardLabelActive,
                      ]}
                    >
                      {quality.label}
                    </Text>
                    <Text style={styles.qualityCardMultiplier}>
                      {quality.priceMultiplier}x price
                    </Text>
                    <Text style={styles.qualityCardDescription}>
                      {quality.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Traveler details</Text>
            <InputField
              label="Full name"
              value={travelerName}
              onChangeText={setTravelerName}
              placeholder="Enter traveler name"
            />
            <InputField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Add phone number"
              keyboardType="phone-pad"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Add email"
              keyboardType="email-address"
            />
            <InputField
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Special requests (optional)"
              multiline
            />
          </View>
        ) : null}

        {step === "details" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Price breakdown</Text>
            <View style={styles.priceNote}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.priceNoteText}>
                {personCount} {personCount === 1 ? "person" : "people"} •{" "}
                {quality?.label} room
              </Text>
            </View>
            <PriceRow
              label="Base fare"
              value={`TK ${calculatedPrice.toLocaleString()}`}
            />
            <PriceRow
              label="Taxes & fees"
              value={`TK ${taxes.toLocaleString()}`}
            />
            <PriceRow label="Service fee" value={`TK ${serviceFee}`} />
            <PriceRow label="Discount" value={`-TK ${discount}`} accent />
            <View style={styles.divider} />
            <PriceRow
              label="Total"
              value={`TK ${totalAmount.toLocaleString()}`}
              bold
            />
          </View>
        ) : null}

        {step === "payment" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment method</Text>
            <PaymentCard
              cardNumber={cardNumber}
              password={password}
              onCardNumberChange={setCardNumber}
              onPasswordChange={setPassword}
              expDate="01/24"
              cvv="454"
            />
          </View>
        ) : null}

        <ActionButton onPress={loading ? () => {} : handleNext}>
          {loading
            ? "Processing..."
            : step === "details"
              ? "Continue to payment"
              : "Confirm & pay"}
        </ActionButton>
      </ScrollView>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.districtModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectingDistrictFor === "from" ? "From" : "To"}{" "}
                District
              </Text>
              <TouchableOpacity
                onPress={() => setShowDistrictModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              value={districtSearchQuery}
              onChangeText={setDistrictSearchQuery}
              placeholder="Search districts..."
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />

            <ScrollView style={styles.districtList}>
              {filteredDistricts.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={styles.districtItem}
                  onPress={() => handleDistrictSelect(district)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={
                      (selectingDistrictFor === "from" &&
                        district === fromDistrict) ||
                      (selectingDistrictFor === "to" && district === toDistrict)
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.districtItemText,
                      ((selectingDistrictFor === "from" &&
                        district === fromDistrict) ||
                        (selectingDistrictFor === "to" &&
                          district === toDistrict)) &&
                        styles.districtItemTextActive,
                    ]}
                  >
                    {district}
                  </Text>
                  {((selectingDistrictFor === "from" &&
                    district === fromDistrict) ||
                    (selectingDistrictFor === "to" &&
                      district === toDistrict)) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
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
        <View style={styles.thankYouOverlay}>
          <View style={styles.thankYouContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.thankYouTitle}>Booking Confirmed!</Text>
            <Text style={styles.thankYouMessage}>
              Your {quality?.label} room for {personCount}{" "}
              {personCount === 1 ? "person" : "people"} in {toDistrict} has been
              confirmed.
            </Text>
            <Text style={styles.bookingId}>
              Booking ID: #TRV{Math.floor(Math.random() * 10000)}
            </Text>

            <View style={styles.bookingSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From → To:</Text>
                <Text style={styles.summaryValue}>
                  {fromDistrict} → {toDistrict}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Guests:</Text>
                <Text style={styles.summaryValue}>
                  {personCount} {personCount === 1 ? "person" : "people"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Room:</Text>
                <Text style={styles.summaryValue}>{quality?.label}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.summaryLabelBold]}>
                  Total Paid:
                </Text>
                <Text style={[styles.summaryValue, styles.summaryValueBold]}>
                  TK {totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.homeButtonText}>Go Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

function StepPill({
  label,
  active,
  index,
}: {
  label: string;
  active: boolean;
  index: number;
}) {
  return (
    <View style={[styles.stepPill, active && styles.stepPillActive]}>
      <View style={[styles.stepDot, active && styles.stepDotActive]}>
        <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>
          {index}
        </Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function StepDivider() {
  return <View style={styles.stepDivider} />;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function PriceRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text
        style={[
          styles.priceLabel,
          bold && styles.priceLabelBold,
          accent && styles.priceLabelAccent,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.priceValue,
          bold && styles.priceValueBold,
          accent && styles.priceValueAccent,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: 40 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: Spacing.sm,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F8FAFC",
  },
  stepPillActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 12,
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  stepLabelActive: {
    color: Colors.primary,
  },
  stepDivider: {
    height: 1,
    width: 30,
    backgroundColor: "#E2E8F0",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  districtBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 4,
  },
  districtHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  districtLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  districtValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  swapIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  swapIcon: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tripInfo: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  tripInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dateBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    gap: 4,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  nightsBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minWidth: 60,
  },
  nightsCount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  nightsLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginTop: 2,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "85%",
    paddingBottom: Spacing.xl,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  calendarDate: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: Radii.lg,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  calendarDateSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  calendarDateText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  calendarDateTextSelected: {
    color: "#fff",
  },
  calendarDateMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  customizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.04)",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.1)",
  },
  customizeLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  customizeLabelText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  customizeSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterButton: {
    padding: 4,
  },
  counterValueContainer: {
    alignItems: "center",
    minWidth: 50,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },
  counterLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: -2,
  },
  qualitySection: {
    gap: Spacing.sm,
  },
  qualityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qualitySectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  qualityArrows: {
    flexDirection: "row",
    gap: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  qualityCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginRight: Spacing.sm,
    width: 140,
    alignItems: "center",
    gap: 4,
  },
  qualityCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EFF6FF",
  },
  qualityCardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  qualityCardLabelActive: {
    color: Colors.primary,
  },
  qualityCardMultiplier: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  qualityCardDescription: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  priceNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    padding: Spacing.sm,
    borderRadius: Radii.sm,
  },
  priceNoteText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#475569",
  },
  priceValue: {
    color: "#0F172A",
    fontWeight: "700",
  },
  priceLabelBold: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 16,
  },
  priceValueBold: {
    fontSize: 18,
    color: Colors.primary,
  },
  priceLabelAccent: {
    color: "#DC2626",
  },
  priceValueAccent: {
    color: "#DC2626",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  districtModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "80%",
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  modalSearchInput: {
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  districtList: {
    paddingHorizontal: Spacing.lg,
  },
  districtItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  districtItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  districtItemTextActive: {
    fontWeight: "700",
    color: Colors.primary,
  },
  thankYouOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  thankYouContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  thankYouMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  bookingId: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
    fontWeight: "600",
  },
  bookingSummary: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  summaryLabelBold: {
    fontWeight: "700",
    color: "#111827",
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

import { Header } from "@/components/header";
import { PaymentCard } from "@/components/payment-card";
import { ThemedView } from "@/components/themed-view";
import {
  bangladeshDistricts,
  calculateStayPrice,
  roomQualities,
} from "@/constants/bangladeshDistricts";
import { Colors, Radii, Spacing } from "@/constants/design";
import { createStayBooking, createTransportBooking } from "@/lib/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

export default function BookingScreen() {
  const params = useLocalSearchParams();
  const bookingType = (params.type as string) || "transport";
  const transportType = params.transportType as string;
  const propertyName = params.propertyName as string;
  const propertyType = params.propertyType as string;
  const location = params.location as string;

  const initialPersonCount = parseInt(params.personCount as string) || 2;
  const initialRoomQuality = (params.roomQuality as string) || "standard";

  const [cardNumber, setCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [travelerName, setTravelerName] = useState("shawon pk");
  const [phone, setPhone] = useState("01521562022");
  const [email, setEmail] = useState("qq@gmail.com");
  const [notes, setNotes] = useState("");

  const [personCount, setPersonCount] = useState(initialPersonCount);
  const [selectedQuality, setSelectedQuality] = useState(initialRoomQuality);
  const [fromDistrict, setFromDistrict] = useState("Dhaka");
  const [toDistrict, setToDistrict] = useState(location || "Cox's Bazar");
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");
  const [selectingDistrictFor, setSelectingDistrictFor] = useState<
    "from" | "to"
  >("from");

  const [step, setStep] = useState<"details" | "payment">("details");
  const [showThankYou, setShowThankYou] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = 1450;
  const calculatedPrice =
    bookingType === "stay"
      ? calculateStayPrice(basePrice, personCount, selectedQuality)
      : basePrice;

  const taxes = Math.round(calculatedPrice * 0.08);
  const serviceFee = 25;
  const discount = Math.round(calculatedPrice * 0.03);
  const totalAmount = calculatedPrice + taxes + serviceFee - discount;

  const quality = roomQualities.find((q) => q.id === selectedQuality);

  const filteredDistricts = bangladeshDistricts.filter((district) =>
    district.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  const handleDistrictSelect = (district: string) => {
    if (selectingDistrictFor === "from") {
      setFromDistrict(district);
    } else {
      setToDistrict(district);
    }
    setShowDistrictModal(false);
    setDistrictSearchQuery("");
  };

  const handleConfirm = async () => {
    // Move to payment step instead of confirming immediately
    if (step === "details") {
      setStep("payment");
      return;
    }

    // Validate payment information
    if (!cardNumber || cardNumber.length < 10) {
      Alert.alert("Invalid Card", "Please enter a valid card number", [
        { text: "OK" },
      ]);
      return;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please enter your card password", [
        { text: "OK" },
      ]);
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        userId: "guest_user",
        travelerName,
        phone,
        email,
        notes,
        baseFare: calculatedPrice,
        taxes,
        serviceFee,
        discount,
        totalAmount,
        paymentMethod: "Credit Card",
        cardLastFour: cardNumber.slice(-4),
      };

      let result;

      if (bookingType === "stay") {
        result = await createStayBooking({
          ...bookingData,
          propertyName: propertyName || "Sea View Resort",
          propertyType: (propertyType as any) || "resort",
          location: toDistrict,
          checkInDate: new Date().toISOString(),
          checkOutDate: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          numberOfGuests: personCount,
          numberOfNights: 2,
        });
      } else {
        result = await createTransportBooking({
          ...bookingData,
          transportType: (transportType as any) || "car",
          from: fromDistrict,
          to: toDistrict,
          travelDate: new Date().toISOString(),
          duration: "8-10 hrs",
        });
      }

      console.log("Booking created successfully:", result);
      const createdBookingId =
        result.data?.transport_booking?.id ||
        result.data?.booking?.id ||
        `TRV${Math.floor(Math.random() * 10000)}`;
      setBookingId(createdBookingId);

      // Show success popup
      setShowThankYou(true);
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error
          ? error.message
          : "Unable to complete booking. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    setShowThankYou(false);
    router.push("/(tabs)");
  };

  const handleNext = () => {
    handleConfirm();
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Confirm Trip" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepper}>
          <StepPill label="Details" active={step === "details"} index={1} />
          <StepDivider />
          <StepPill label="Payment" active={step === "payment"} index={2} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>

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
              <View style={styles.swapIcon}>
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
              </View>
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

          <View style={styles.tripInfo}>
            <View style={styles.tripInfoItem}>
              <Ionicons name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.tripInfoText}>2 Days 4 Night</Text>
            </View>
            <View style={styles.tripInfoItem}>
              <Ionicons
                name="calendar"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.tripInfoText}>20-05, May, 2022</Text>
            </View>
          </View>
        </View>

        {bookingType === "stay" && step === "details" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customize your stay</Text>

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
                  style={[
                    styles.counterButton,
                    personCount <= 1 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => setPersonCount(Math.max(1, personCount - 1))}
                  disabled={personCount <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove-circle"
                    size={28}
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
                  style={[
                    styles.counterButton,
                    personCount >= 10 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => setPersonCount(Math.min(10, personCount + 1))}
                  disabled={personCount >= 10}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add-circle"
                    size={28}
                    color={
                      personCount >= 10 ? Colors.textMuted : Colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.qualitySection}>
              <Text style={styles.qualitySectionLabel}>Room quality</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {roomQualities.map((quality) => (
                  <TouchableOpacity
                    key={quality.id}
                    style={[
                      styles.qualityCard,
                      selectedQuality === quality.id &&
                        styles.qualityCardActive,
                    ]}
                    onPress={() => setSelectedQuality(quality.id)}
                  >
                    <Ionicons
                      name={quality.icon as any}
                      size={24}
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
                      {quality.priceMultiplier}x
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
            {bookingType === "stay" && (
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
            )}
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
          <>
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

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              {bookingType === "stay" && (
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
              )}
              {bookingType === "transport" && (
                <View style={styles.priceNote}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={Colors.primary}
                  />
                  <Text style={styles.priceNoteText}>
                    {fromDistrict} → {toDistrict} • {transportType || "Car"}
                  </Text>
                </View>
              )}
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
          </>
        ) : null}

        <TouchableOpacity
          style={[
            styles.actionButton,
            isSubmitting && styles.actionButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {isSubmitting
              ? "Processing..."
              : step === "details"
              ? "Continue to payment"
              : `Confirm & pay TK ${totalAmount.toLocaleString()}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search districts..."
              placeholderTextColor={Colors.textSecondary}
              value={districtSearchQuery}
              onChangeText={setDistrictSearchQuery}
            />

            <ScrollView style={styles.districtList}>
              {filteredDistricts.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={styles.districtItem}
                  onPress={() => handleDistrictSelect(district)}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.districtItemText,
                      (selectingDistrictFor === "from"
                        ? fromDistrict
                        : toDistrict) === district &&
                        styles.districtItemTextActive,
                    ]}
                  >
                    {district}
                  </Text>
                  {(selectingDistrictFor === "from"
                    ? fromDistrict
                    : toDistrict) === district && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThankYou(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouMessage}>
              Your trip has been confirmed successfully.
            </Text>
            <Text style={styles.bookingIdText}>Booking ID: #{bookingId}</Text>

            <View style={styles.bookingSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Route:</Text>
                <Text style={styles.summaryValue}>
                  {fromDistrict} → {toDistrict}
                </Text>
              </View>
              {bookingType === "stay" && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Persons:</Text>
                    <Text style={styles.summaryValue}>{personCount}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Room:</Text>
                    <Text style={styles.summaryValue}>{quality?.label}</Text>
                  </View>
                </>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total:</Text>
                <Text style={styles.summaryValueBold}>
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
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    backgroundColor: "#F8FAFC",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    marginTop: Spacing.sm,
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
  customizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
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
    backgroundColor: "rgba(59, 130, 246, 0.15)",
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
  counterButtonDisabled: {
    opacity: 0.3,
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
  qualitySectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
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
  thankYouModalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    marginTop: "30%",
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
  bookingIdText: {
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
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

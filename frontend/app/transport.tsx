import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import {
  bangladeshDistricts,
  transportPricing,
  transportTypes,
} from "@/constants/transportData";

export default function TransportHub() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(
    null
  );
  const [travelDate, setTravelDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Payment details
  const [paymentNumber, setPaymentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fromSuggestions = bangladeshDistricts.filter((district) =>
    district.toLowerCase().includes(fromLocation.toLowerCase())
  );

  const toSuggestions = bangladeshDistricts.filter((district) =>
    district.toLowerCase().includes(toLocation.toLowerCase())
  );

  const calculateDistance = () => {
    return Math.floor(Math.random() * 300) + 50;
  };

  const calculatePrice = (transportType: string) => {
    if (!fromLocation || !toLocation) return 0;
    const distance = calculateDistance();
    const pricing = transportPricing[transportType];
    return pricing.basePrice + distance * pricing.perKm;
  };

  const handleSearchRoutes = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert(
        "Missing Information",
        "Please select both From and To locations"
      );
      return;
    }
    if (fromLocation === toLocation) {
      Alert.alert("Invalid Route", "From and To locations cannot be the same");
      return;
    }
    setSelectedTransport(null);
  };

  const handleBookNow = (transportType: string) => {
    if (!fromLocation || !toLocation) {
      Alert.alert("Missing Information", "Please search routes first");
      return;
    }
    setSelectedTransport(transportType);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!travelDate) {
      Alert.alert("Missing Date", "Please select travel date");
      return;
    }
    if (!paymentNumber || paymentNumber.replace(/\s/g, "").length < 11) {
      Alert.alert("Invalid Payment", "Please enter valid payment number");
      return;
    }
    if (!password || password.length < 4) {
      Alert.alert("Invalid Password", "Please enter password");
      return;
    }

    setIsLoading(true);

    try {
      const userEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;

      if (!userEmail) {
        Alert.alert("Error", "Please login again");
        setIsLoading(false);
        return;
      }

      const transportType = selectedTransport || "car";
      const price = calculatePrice(transportType);
      const serviceFee = 50;
      const totalPrice = price + serviceFee;

      const bookingData = {
        booking_type: "transport",
        trip_name: `${fromLocation} to ${toLocation}`,
        location: `${fromLocation} → ${toLocation}`,
        check_in_date: new Date(travelDate).toISOString(),
        check_out_date: new Date(travelDate).toISOString(),
        guests: passengers,
        item_id: transportType,
        item_name:
          transportTypes.find((t) => t.id === transportType)?.name ||
          "Transport",
        item_image: "",
        price_per_unit: price / passengers,
        total_days_or_units: 1,
        subtotal: price,
        service_fee: serviceFee,
        total_price: totalPrice,
        currency: "TK",
        payment_method: "mobile",
        payment_number: paymentNumber.replace(/\s/g, "").slice(-4),
        payment_status: "completed",
        booking_status: "confirmed",
      };

      const response = await fetch("http://localhost:5001/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create booking");
      }

      setShowBookingModal(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/(tabs)");
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = (
    item: string,
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        onSelect(item);
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }}
    >
      <Ionicons name="location" size={18} color={Colors.primary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Explore Bangladesh</Text>
            <Text style={styles.heroSubtitle}>Your journey starts here</Text>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Plan Your Route</Text>

          {/* From Location */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="location" size={22} color={Colors.primary} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="From (Type district name)"
              placeholderTextColor="#999"
              value={fromLocation}
              onChangeText={(text) => {
                setFromLocation(text);
                setShowFromSuggestions(text.length > 0);
              }}
              onFocus={() => setShowFromSuggestions(fromLocation.length > 0)}
            />
            {fromLocation.length > 0 && (
              <TouchableOpacity onPress={() => setFromLocation("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* From Suggestions */}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={fromSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) =>
                  renderSuggestion(item, setFromLocation)
                }
                style={styles.suggestionsList}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* To Location */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrapper}>
              <Ionicons name="flag" size={22} color={Colors.accent} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="To (Type district name)"
              placeholderTextColor="#999"
              value={toLocation}
              onChangeText={(text) => {
                setToLocation(text);
                setShowToSuggestions(text.length > 0);
              }}
              onFocus={() => setShowToSuggestions(toLocation.length > 0)}
            />
            {toLocation.length > 0 && (
              <TouchableOpacity onPress={() => setToLocation("")}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* To Suggestions */}
          {showToSuggestions && toSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={toSuggestions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => renderSuggestion(item, setToLocation)}
                style={styles.suggestionsList}
                scrollEnabled={false}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchRoutes}
          >
            <Ionicons name="search" size={20} color="#FFF" />
            <Text style={styles.searchButtonText}>Search Routes</Text>
          </TouchableOpacity>
        </View>

        {/* Transport Options */}
        {fromLocation && toLocation && (
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Available Transport</Text>
            <Text style={styles.sectionSubtitle}>
              Choose your preferred mode of transportation
            </Text>
            {transportTypes.map((transport) => {
              const price = calculatePrice(transport.id);
              const iconName =
                transport.id === "car"
                  ? "car-sport"
                  : transport.id === "bus"
                  ? "bus"
                  : transport.id === "bike"
                  ? "bicycle"
                  : "boat";

              return (
                <TouchableOpacity
                  key={transport.id}
                  style={styles.transportCard}
                  onPress={() => handleBookNow(transport.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transportIconContainer}>
                    <Ionicons
                      name={iconName as any}
                      size={32}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.transportInfo}>
                    <Text style={styles.transportName}>{transport.name}</Text>
                    <Text style={styles.transportDescription}>
                      {transport.description}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Ionicons
                        name="cash-outline"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.transportPrice}>৳ {price} TK</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookNow(transport.id)}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Booking</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Trip Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Trip Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>From:</Text>
                  <Text style={styles.summaryValue}>{fromLocation}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To:</Text>
                  <Text style={styles.summaryValue}>{toLocation}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Transport:</Text>
                  <Text style={styles.summaryValue}>
                    {
                      transportTypes.find((t) => t.id === selectedTransport)
                        ?.name
                    }
                  </Text>
                </View>
              </View>

              {/* Travel Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Travel Date</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  value={travelDate}
                  onChangeText={setTravelDate}
                />
              </View>

              {/* Passengers */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Passengers</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{passengers}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setPassengers(passengers + 1)}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Payment Details */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Payment Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="01XXXXXXXXX"
                  value={paymentNumber}
                  onChangeText={setPaymentNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Price Breakdown */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base Fare:</Text>
                  <Text style={styles.priceValue}>
                    ৳ {calculatePrice(selectedTransport || "car")}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service Fee:</Text>
                  <Text style={styles.priceValue}>৳ 50</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceRow}>
                  <Text style={styles.priceTotalLabel}>Total:</Text>
                  <Text style={styles.priceTotalValue}>
                    ৳ {calculatePrice(selectedTransport || "car") + 50} TK
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} animationType="fade" transparent={true}>
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={Colors.success}
            />
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your transport has been booked successfully
            </Text>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  heroBanner: {
    height: 180,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radii.medium,
    overflow: "hidden",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
  },
  searchSection: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: Radii.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  inputIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  suggestionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: Radii.small,
    marginBottom: Spacing.sm,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.medium,
    alignItems: "center",
    marginTop: Spacing.sm,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  optionsSection: {
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  transportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  transportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary + "30",
  },
  transportIcon: {
    fontSize: 28,
  },
  transportInfo: {
    flex: 1,
  },
  transportName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transportDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transportPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.large,
    borderTopRightRadius: Radii.large,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: Colors.primary + "10",
    borderRadius: Radii.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: Radii.small,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderRadius: Radii.small,
    padding: Spacing.sm,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  counterValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginHorizontal: Spacing.xl,
  },
  priceCard: {
    backgroundColor: Colors.background,
    borderRadius: Radii.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.small,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.large,
    padding: Spacing.xl * 2,
    alignItems: "center",
    marginHorizontal: Spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

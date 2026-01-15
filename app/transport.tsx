import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { createTransportBooking } from "@/lib/api";

type TransportType = "car" | "bus" | "bike" | "boat";

const TYPE_ICON: Record<TransportType, string> = {
  car: "car",
  bus: "bus",
  bike: "bicycle",
  boat: "boat",
};

const TRANSPORT_OPTIONS = [
  {
    type: "car" as TransportType,
    title: "Car Rental",
    description: "Comfortable private rides",
    routes: [
      {
        from: "Dhaka",
        to: "Cox's Bazar",
        price: "8,000 - 12,000",
        duration: "8-10 hrs",
      },
      {
        from: "Dhaka",
        to: "Sylhet",
        price: "6,000 - 9,000",
        duration: "5-6 hrs",
      },
      {
        from: "Dhaka",
        to: "Bandarban",
        price: "10,000 - 15,000",
        duration: "10-12 hrs",
      },
    ],
  },
  {
    type: "bus" as TransportType,
    title: "Bus Services",
    description: "Affordable long-distance travel",
    providers: ["Green Line", "Shyamoli", "Hanif", "Ena Transport"],
    priceRange: "1,000 - 2,500",
  },
  {
    type: "bike" as TransportType,
    title: "Ride Sharing",
    description: "Quick local commute",
    services: ["Uber", "Pathao", "Obhai"],
    priceRange: "50 - 500",
  },
  {
    type: "boat" as TransportType,
    title: "Boat Rides",
    description: "Scenic water transport",
    locations: ["Sylhet", "Cox's Bazar", "Sundarbans", "Khulna"],
    priceRange: "200 - 3,000",
  },
];

export default function TransportHub() {
  const [selectedType, setSelectedType] = useState<TransportType | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Booking details
  const [travelerName, setTravelerName] = useState("John Doe");
  const [phone, setPhone] = useState("01521562022");
  const [email, setEmail] = useState("john@example.com");
  const [travelDate, setTravelDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [passengers, setPassengers] = useState(1);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleBook = (type: TransportType) => {
    setSelectedType(type);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!travelDate) {
      Alert.alert("Missing Date", "Please select travel date");
      return;
    }

    if (!fromLocation || !toLocation) {
      Alert.alert("Missing Locations", "Please set from and to locations");
      return;
    }

    setIsLoading(true);

    try {
      const basePrice = 1450; // Default price
      const serviceFee = 50;
      const totalAmount = basePrice * passengers + serviceFee;

      const bookingData = {
        transportType: selectedType,
        from: fromLocation,
        to: toLocation,
        travelerName,
        phone,
        email,
        travelDate: new Date(travelDate).toISOString(),
        baseFare: basePrice,
        taxes: Math.round(totalAmount * 0.08),
        serviceFee,
        discount: Math.round(totalAmount * 0.03),
        totalAmount,
        paymentMethod: "pending",
        userId: "guest_user",
      };

      const result = await createTransportBooking(bookingData);

      setBookingId(result.data?.transport_booking?.id || result.data?.id);
      setShowBookingModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      Alert.alert(
        "Booking Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentNumber || paymentNumber.replace(/\s/g, "").length < 11) {
      Alert.alert("Invalid Payment", "Please enter valid payment number");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter your PIN");
      return;
    }

    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found");
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        payment_method: paymentMethod,
        payment_number: paymentNumber.replace(/\s/g, ""),
        transaction_id: `TXN-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      const response = await fetch(
        `http://localhost:5001/api/transport/${bookingId}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }

      // Close payment modal and show success
      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setFromLocation("");
        setToLocation("");
        setSelectedType(null);
        setTravelerName("John Doe");
        setPhone("01521562022");
        setEmail("john@example.com");
        setTravelDate("");
        setPassengers(1);
        setPaymentNumber("");
        setPassword("");
      }, 3000);
    } catch (error) {
      Alert.alert(
        "Payment Failed",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    if (showSuccessModal) {
      setShowSuccessModal(false);
    } else if (showPaymentModal) {
      setShowPaymentModal(false);
    } else if (showBookingModal) {
      setShowBookingModal(false);
    } else {
      router.replace("/");
    }
  };

  const handleSearchRoutes = () => {
    if (!fromLocation || !toLocation) {
      Alert.alert("Missing Locations", "Please set from and to locations");
      return;
    }
    if (fromLocation === toLocation) {
      Alert.alert("Invalid Route", "From and To locations cannot be the same");
      return;
    }
    setSelectedType(null);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Handle month navigation
    const goToPrevMonth = () => {
      const prev = new Date(currentYear, currentMonth - 1, 1);
      setSelectedDate(prev);
    };

    const goToNextMonth = () => {
      const next = new Date(currentYear, currentMonth + 1, 1);
      setSelectedDate(next);
    };

    // Handle date selection
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const selectDate = (day: number) => {
      const selected = new Date(currentYear, currentMonth, day);
      selected.setHours(0, 0, 0, 0);
      if (selected >= today) {
        setSelectedDate(selected);
        setTravelDate(formatLocalDate(selected));
        setShowCalendar(false);
      }
    };

    // Build calendar days array
    const days: React.ReactNode[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);

      const isToday = date.getTime() === today.getTime();
      const isSelected = travelDate && formatLocalDate(date) === travelDate;
      const isPast = date < today;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.calendarToday,
            isSelected && styles.calendarSelected,
            isPast && styles.calendarPast,
          ]}
          onPress={() => !isPast && selectDate(day)}
          disabled={isPast}
        >
          <Text
            style={[
              styles.calendarDayText,
              isToday && styles.calendarTodayText,
              isSelected && styles.calendarSelectedText,
              isPast && styles.calendarPastText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendar}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarHeaderText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Day Names Header */}
        <View style={styles.calendarDayNames}>
          {dayNames.map((name) => (
            <View key={name} style={styles.calendarDayName}>
              <Text style={styles.calendarDayNameText}>{name}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>{days}</View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Ionicons
                name="location"
                size={18}
                color={Colors.textPrimary}
                style={{ marginRight: Spacing.sm }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="From"
                placeholderTextColor="#999"
                value={fromLocation}
                onChangeText={setFromLocation}
              />
            </View>
            <View style={styles.searchInputWrapper}>
              <Ionicons
                name="flag"
                size={18}
                color={Colors.textPrimary}
                style={{ marginRight: Spacing.sm }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="To"
                placeholderTextColor="#999"
                value={toLocation}
                onChangeText={setToLocation}
              />
            </View>
          </View>

          {/* Date Selection Button */}
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowCalendar(!showCalendar)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Spacing.md }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.dateSelectorLabel}>Travel Date</Text>
              <Text style={styles.dateSelectorText}>
                {travelDate
                  ? new Date(travelDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "Select your travel date"}
              </Text>
            </View>
            <Ionicons
              name={showCalendar ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {/* Calendar View */}
          {showCalendar && (
            <View style={styles.calendarContainer}>{renderCalendar()}</View>
          )}

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchRoutes}
          >
            <Text style={styles.searchButtonText}>Search Routes</Text>
          </TouchableOpacity>
        </View>

        {/* Transport Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Transport Options</Text>
          {TRANSPORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={styles.optionCard}
              onPress={() => setSelectedType(option.type)}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionIconContainer}>
                  <Ionicons
                    name={TYPE_ICON[option.type]}
                    size={24}
                    color={Colors.secondary}
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBook(option.type)}
                >
                  <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
              </View>

              {selectedType === option.type && (
                <View style={styles.optionDetails}>
                  {option.type === "car" && option.routes && (
                    <View style={styles.detailsContent}>
                      {option.routes.map((route, idx) => (
                        <View key={idx} style={styles.routeRow}>
                          <View style={styles.routeInfo}>
                            <Text style={styles.routeText}>
                              {route.from} → {route.to}
                            </Text>
                            <Text style={styles.routeDuration}>
                              {route.duration}
                            </Text>
                          </View>
                          <Text style={styles.routePrice}>৳ {route.price}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {option.type === "bus" && option.providers && (
                    <View style={styles.detailsContent}>
                      <Text style={styles.detailLabel}>Providers:</Text>
                      <View style={styles.chipContainer}>
                        {option.providers.map((provider, idx) => (
                          <View key={idx} style={styles.chip}>
                            <Text style={styles.chipText}>{provider}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.priceInfo}>
                        Price Range: ৳ {option.priceRange}
                      </Text>
                    </View>
                  )}

                  {option.type === "bike" && option.services && (
                    <View style={styles.detailsContent}>
                      <Text style={styles.detailLabel}>
                        Available Services:
                      </Text>
                      <View style={styles.chipContainer}>
                        {option.services.map((service, idx) => (
                          <View key={idx} style={styles.chip}>
                            <Text style={styles.chipText}>{service}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.priceInfo}>
                        Price Range: ৳ {option.priceRange}
                      </Text>
                    </View>
                  )}

                  {option.type === "boat" && option.locations && (
                    <View style={styles.detailsContent}>
                      <Text style={styles.detailLabel}>Popular Locations:</Text>
                      <View style={styles.chipContainer}>
                        {option.locations.map((location, idx) => (
                          <View key={idx} style={styles.chip}>
                            <Text style={styles.chipText}>{location}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.priceInfo}>
                        Price Range: ৳ {option.priceRange}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Routes */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular Routes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            <View style={styles.popularCard}>
              <Text style={styles.popularRoute}>Dhaka → Cox's Bazar</Text>
              <Text style={styles.popularPrice}>From ৳ 1,200</Text>
            </View>
            <View style={styles.popularCard}>
              <Text style={styles.popularRoute}>Dhaka → Sylhet</Text>
              <Text style={styles.popularPrice}>From ৳ 800</Text>
            </View>
            <View style={styles.popularCard}>
              <Text style={styles.popularRoute}>Chittagong → Bandarban</Text>
              <Text style={styles.popularPrice}>From ৳ 600</Text>
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bookingModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Transport</Text>
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Trip Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.input}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  placeholder="Enter departure location"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.input}
                  value={toLocation}
                  onChangeText={setToLocation}
                  placeholder="Enter destination"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Travel Date</Text>
                <TextInput
                  style={styles.input}
                  value={travelDate}
                  onChangeText={setTravelDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Passengers</Text>
                <TextInput
                  style={styles.input}
                  value={passengers.toString()}
                  onChangeText={(text) => setPassengers(parseInt(text) || 1)}
                  keyboardType="numeric"
                  placeholder="Number of passengers"
                />
              </View>

              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={travelerName}
                  onChangeText={setTravelerName}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="Enter email address"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleConfirmBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <View style={styles.paymentMethods}>
                {["bkash", "nagad", "rocket", "card"].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethod,
                      paymentMethod === method && styles.paymentMethodActive,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text
                      style={[
                        styles.paymentMethodText,
                        paymentMethod === method &&
                          styles.paymentMethodTextActive,
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {paymentMethod === "card" ? "Card Number" : "Mobile Number"}
                </Text>
                <TextInput
                  style={styles.input}
                  value={paymentNumber}
                  onChangeText={setPaymentNumber}
                  keyboardType={
                    paymentMethod === "card" ? "numeric" : "phone-pad"
                  }
                  placeholder={
                    paymentMethod === "card"
                      ? "Enter card number"
                      : "Enter mobile number"
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {paymentMethod === "card" ? "CVV" : "PIN"}
                </Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  keyboardType="numeric"
                  placeholder={
                    paymentMethod === "card" ? "Enter CVV" : "Enter PIN"
                  }
                />
              </View>

              <View style={styles.priceSummary}>
                <Text style={styles.priceSummaryTitle}>Price Summary</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base Fare</Text>
                  <Text style={styles.priceValue}>৳ 1,450</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service Fee</Text>
                  <Text style={styles.priceValue}>৳ 50</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax</Text>
                  <Text style={styles.priceValue}>৳ 120</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.priceTotalLabel}>Total</Text>
                  <Text style={styles.priceTotalValue}>৳ 1,620</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Pay Now</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Ionicons
              name="checkmark-circle"
              size={100}
              color={Colors.success || "#10B981"}
            />
            <Text style={styles.successTitle}>Thank You!</Text>
            <Text style={styles.successMessage}>
              Your payment has been processed successfully.
            </Text>
            <Text style={styles.successSubMessage}>
              Your transport booking is confirmed!
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
  backIcon: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "600",
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
    marginBottom: Spacing.md,
  },
  searchRow: {
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.small,
    alignItems: "center",
    marginTop: Spacing.sm,
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
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.medium,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  bookButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  optionDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  detailsContent: {
    gap: Spacing.sm,
  },
  routeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  routeInfo: {
    flex: 1,
  },
  routeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  routeDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  routePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  chipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
  priceInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  popularSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  popularScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  popularCard: {
    backgroundColor: Colors.accent + "20",
    padding: Spacing.md,
    borderRadius: Radii.medium,
    minWidth: 160,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  popularRoute: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  popularPrice: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bookingModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "80%",
    paddingBottom: Spacing.xl,
  },
  paymentModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "90%",
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.background,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 16,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  paymentMethod: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.background,
    backgroundColor: Colors.background,
  },
  paymentMethodActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "20",
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  paymentMethodTextActive: {
    color: Colors.primary,
  },
  priceSummary: {
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  priceSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  priceTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  priceTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background,
    marginVertical: Spacing.sm,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  successSubMessage: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginHorizontal: 0,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dateSelectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  calendarContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  calendar: {
    width: "100%",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  calendarDayNames: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  calendarDayName: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  calendarDayNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xs,
  },
  calendarDayText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calendarToday: {
    backgroundColor: Colors.primary + "20",
    borderRadius: Radii.sm,
  },
  calendarTodayText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  calendarSelected: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
  },
  calendarSelectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarPast: {
    opacity: 0.3,
  },
  calendarPastText: {
    color: Colors.textMuted,
  },
});

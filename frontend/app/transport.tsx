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
import { api } from "@/lib/api";

export default function TransportHub() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTransport, setSelectedTransport] = useState<string | null>(
    null
  );
  const [travelDate, setTravelDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");
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
    // Use stored distance to prevent recalculation on every render
    const distance = calculatedDistance || calculateDistance();
    const pricing = transportPricing[transportType];
    // Base price multiplied by number of passengers
    const baseFare = pricing.basePrice + distance * pricing.perKm;
    return baseFare * passengers;
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
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
    setShowCalendar(false);
  };

  const handleBookNow = (transportType: string) => {
    if (!fromLocation || !toLocation) {
      Alert.alert("Missing Information", "Please search routes first");
      return;
    }
    // Calculate and store distance once when booking starts
    setCalculatedDistance(calculateDistance());
    setSelectedTransport(transportType);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!travelDate) {
      Alert.alert("Missing Date", "Please select travel date");
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
      const distance = calculatedDistance;
      const pricing = transportPricing[transportType];
      const baseFare = pricing.basePrice + distance * pricing.perKm;
      const perPassengerFare = baseFare;
      const serviceFee = 50;
      const totalAmount = baseFare * passengers + serviceFee;

      const bookingData = {
        from_location: fromLocation,
        to_location: toLocation,
        transport_type: transportType,
        travel_date: new Date(travelDate).toISOString(),
        passengers,
        base_fare: baseFare,
        per_passenger_fare: perPassengerFare,
        service_fee: serviceFee,
        total_amount: totalAmount,
        payment_method: "pending",
        payment_status: "pending",
      };

      const result = await api.createTransportBooking(bookingData);

      setBookingId(result.data?.booking_id || result.data?.id);

      // Close booking modal and show payment modal
      setShowBookingModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("❌ Booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert(
        "Booking Failed",
        `Failed to create booking: ${errorMessage}\n\nPlease check:\n- Backend is running on port 5001\n- You are logged in\n- Network connection is working`
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
    if (!password || password.length < 4) {
      Alert.alert("Invalid Password", "Please enter your PIN");
      return;
    }

    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found");
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

      const paymentData = {
        payment_method: paymentMethod,
        payment_number: paymentNumber.replace(/\s/g, ""),
        transaction_id: `TXN-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      await api.request({
        method: "POST",
        endpoint: `/transport/${bookingId}/payment`,
        body: paymentData,
      });

      // Close payment modal and show success
      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // Reset form
      setPaymentNumber("");
      setPassword("");
      setPaymentMethod("bkash");

      // Redirect after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setFromLocation("");
        setToLocation("");
        setSelectedTransport(null);
        setTravelDate("");
        setPassengers(1);
        router.replace("/");
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
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

  const renderCalendar = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

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

    const goToPrevMonth = () => {
      const prev = new Date(currentYear, currentMonth - 1, 1);
      setSelectedDate(prev);
    };

    const goToNextMonth = () => {
      const next = new Date(currentYear, currentMonth + 1, 1);
      setSelectedDate(next);
    };

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

    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

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
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarHeaderText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarDayNames}>
          {dayNames.map((name) => (
            <View key={name} style={styles.calendarDayName}>
              <Text style={styles.calendarDayNameText}>{name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>{days}</View>
      </View>
    );
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

          {/* Date Selection */}
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
                  : `Select date (Today: ${new Date().toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      }
                    )})`}
              </Text>
            </View>
            <Ionicons
              name={showCalendar ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>{renderCalendar()}</View>
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
                    <Text style={styles.dateSelectorLabel}>Selected Date</Text>
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
                {showCalendar && (
                  <View style={styles.calendarContainer}>
                    {renderCalendar()}
                  </View>
                )}
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
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Number of Passengers:</Text>
                  <Text style={styles.priceValue}>{passengers}</Text>
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

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Payment Method Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Choose Payment Gateway</Text>
                <View style={styles.paymentMethods}>
                  {[
                    { id: "bkash", name: "bKash", icon: "logo-bitcoin" },
                    { id: "nagad", name: "Nagad", icon: "wallet" },
                    { id: "rocket", name: "Rocket", icon: "rocket" },
                    { id: "card", name: "Card", icon: "card" },
                  ].map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodCard,
                        paymentMethod === method.id &&
                          styles.paymentMethodCardActive,
                      ]}
                      onPress={() => setPaymentMethod(method.id)}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={32}
                        color={
                          paymentMethod === method.id
                            ? Colors.primary
                            : Colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.paymentMethodName,
                          paymentMethod === method.id &&
                            styles.paymentMethodNameActive,
                        ]}
                      >
                        {method.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Details */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {paymentMethod === "card" ? "Card Number" : "Mobile Number"}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={
                    paymentMethod === "card"
                      ? "1234 5678 9012 3456"
                      : "01XXXXXXXXX"
                  }
                  value={paymentNumber}
                  onChangeText={setPaymentNumber}
                  keyboardType={
                    paymentMethod === "card" ? "numeric" : "phone-pad"
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {paymentMethod === "card" ? "PIN" : "Password/PIN"}
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={`Enter your ${
                    paymentMethod === "card" ? "PIN" : "password"
                  }`}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  keyboardType="numeric"
                />
              </View>

              {/* Amount Display */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Amount to Pay</Text>
                <Text style={styles.amountValue}>
                  ৳ {calculatePrice(selectedTransport || "car") + 50} TK
                </Text>
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.confirmButtonDisabled,
                ]}
                onPress={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="#FFF" />
                    <Text style={styles.confirmButtonText}>Pay Now</Text>
                  </>
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
              size={100}
              color={Colors.success}
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
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.medium,
    padding: Spacing.md,
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
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  calendarContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    fontSize: 16,
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
    borderRadius: Radii.small,
  },
  calendarTodayText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  calendarSelected: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.small,
  },
  calendarSelectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  calendarPast: {
    opacity: 0.3,
  },
  calendarPastText: {
    color: Colors.textSecondary,
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
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
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
  successSubMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  paymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  paymentMethodCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: Radii.medium,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  paymentMethodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  paymentMethodNameActive: {
    color: Colors.primary,
  },
  amountCard: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: Radii.medium,
    padding: Spacing.lg,
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
});

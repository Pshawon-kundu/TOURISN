import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    location?: string;
    image?: string;
    rating?: string;
    price?: string;
    currency?: string;
    type?: string;
    capacity?: string;
    description?: string;
  }>();

  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000)
  );
  const [showDateModal, setShowDateModal] = useState(false);
  const [datePickerType, setDatePickerType] = useState<"checkin" | "checkout">(
    "checkin"
  );
  const [tempDateInput, setTempDateInput] = useState("");
  const [guests, setGuests] = useState(1);

  // Editable trip details
  const [editableTripName, setEditableTripName] = useState(
    params.name ?? "Trip"
  );
  const [editableLocation, setEditableLocation] = useState(
    params.location ?? ""
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempTripName, setTempTripName] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  const tripName = editableTripName;
  const location = editableLocation;
  const image = params.image ?? "";
  const rating = params.rating ?? "4.5";
  const pricePerDay = parseFloat(params.price ?? "0");
  const currency = params.currency ?? "TK";
  const tripType = params.type ?? "hotel";
  const capacity = parseInt(params.capacity ?? "2");
  const description = params.description ?? "";

  // Calculate number of days
  const daysDiff = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = pricePerDay * daysDiff;

  const openDatePicker = (type: "checkin" | "checkout") => {
    setDatePickerType(type);
    const currentDate = type === "checkin" ? checkInDate : checkOutDate;
    setTempDateInput(formatDateForInput(currentDate));
    setShowDateModal(true);
  };

  const handleDateConfirm = () => {
    try {
      const newDate = new Date(tempDateInput);
      if (isNaN(newDate.getTime())) {
        alert("Invalid date format. Please use MM/DD/YYYY");
        return;
      }

      if (datePickerType === "checkin") {
        setCheckInDate(newDate);
        if (newDate >= checkOutDate) {
          setCheckOutDate(new Date(newDate.getTime() + 86400000));
        }
      } else {
        if (newDate > checkInDate) {
          setCheckOutDate(newDate);
        } else {
          alert("Check-out must be after check-in");
          return;
        }
      }
      setShowDateModal(false);
    } catch (error) {
      alert("Invalid date");
    }
  };

  const formatDateForInput = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const openEditModal = () => {
    setTempTripName(editableTripName);
    setTempLocation(editableLocation);
    setShowEditModal(true);
  };

  const handleEditConfirm = () => {
    if (tempTripName.trim()) {
      setEditableTripName(tempTripName.trim());
    }
    if (tempLocation.trim()) {
      setEditableLocation(tempLocation.trim());
    }
    setShowEditModal(false);
  };

  const handleBookNow = () => {
    router.push({
      pathname: "/booking-confirm",
      params: {
        tripName,
        location,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: guests.toString(),
        totalPrice: totalPrice.toString(),
        currency,
        itemId: params.id ?? "",
        itemName: params.name ?? tripName,
        itemImage: image,
        pricePerUnit: pricePerDay.toString(),
        bookingType: tripType,
      },
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{tripType.toUpperCase()}</Text>
          </View>
        </View>

        {/* Title & Location */}
        <View style={styles.titleSection}>
          <View style={styles.titleWithEdit}>
            <Text style={styles.title}>{tripName}</Text>
            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Ionicons name="pencil" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#FCD34D" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Capacity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Capacity</Text>
          <View style={styles.capacityRow}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text style={styles.capacityText}>Up to {capacity} guests</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Dates</Text>

          {/* Check-in */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openDatePicker("checkin")}
          >
            <View style={styles.dateButtonLeft}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{formatDate(checkInDate)}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Check-out */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => openDatePicker("checkout")}
          >
            <View style={styles.dateButtonLeft}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{formatDate(checkOutDate)}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.daysInfo}>
            <Text style={styles.daysText}>
              {daysDiff} {daysDiff === 1 ? "night" : "nights"}
            </Text>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestsControl}>
            <TouchableOpacity
              style={[
                styles.guestButton,
                guests <= 1 && styles.guestButtonDisabled,
              ]}
              onPress={() => guests > 1 && setGuests(guests - 1)}
              disabled={guests <= 1}
            >
              <Ionicons
                name="remove"
                size={24}
                color={guests <= 1 ? "#9CA3AF" : Colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.guestsText}>{guests}</Text>
            <TouchableOpacity
              style={[
                styles.guestButton,
                guests >= capacity && styles.guestButtonDisabled,
              ]}
              onPress={() => guests < capacity && setGuests(guests + 1)}
              disabled={guests >= capacity}
            >
              <Ionicons
                name="add"
                size={24}
                color={guests >= capacity ? "#9CA3AF" : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {currency} {pricePerDay.toLocaleString()} x {daysDiff}{" "}
              {daysDiff === 1 ? "night" : "nights"}
            </Text>
            <Text style={styles.priceValue}>
              {currency} {totalPrice.toLocaleString()}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service fee</Text>
            <Text style={styles.priceValue}>{currency} 50</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {currency} {(totalPrice + 50).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>
            {currency} {(totalPrice + 50).toLocaleString()}
          </Text>
          <Text style={styles.bottomSubtext}>
            {daysDiff} {daysDiff === 1 ? "night" : "nights"}
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {datePickerType === "checkin" ? "Check-in" : "Check-out"}{" "}
              Date
            </Text>
            <Text style={styles.modalSubtitle}>
              Enter date in MM/DD/YYYY format
            </Text>

            <View style={styles.dateInputContainer}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <TextInput
                style={styles.dateInput}
                value={tempDateInput}
                onChangeText={setTempDateInput}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Trip Details Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Trip Details</Text>
            <Text style={styles.modalSubtitle}>
              Update your trip name and location
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trip Name</Text>
              <View style={styles.dateInputContainer}>
                <Ionicons name="airplane" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.dateInput}
                  value={tempTripName}
                  onChangeText={setTempTripName}
                  placeholder="Enter trip name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.dateInputContainer}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.dateInput}
                  value={tempLocation}
                  onChangeText={setTempLocation}
                  placeholder="Enter location"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEditConfirm}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: Spacing.xl + 8,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  typeBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.small,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  titleSection: {
    padding: Spacing.lg,
  },
  titleWithEdit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  editButton: {
    padding: Spacing.sm,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: Radii.large,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  capacityText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: Radii.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: Spacing.sm,
  },
  dateButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  daysInfo: {
    padding: Spacing.sm,
    alignItems: "center",
  },
  daysText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  guestsControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  guestButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "#9CA3AF",
  },
  guestsText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    minWidth: 40,
    textAlign: "center",
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
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  bottomSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: Radii.large,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: Spacing.md,
    borderRadius: Radii.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: Spacing.lg,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    padding: Spacing.sm,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.medium,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
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
});

import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

type TransportType = "car" | "bus" | "bike" | "boat";

const TRANSPORT_OPTIONS = [
  {
    type: "car" as TransportType,
    icon: "🚗",
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
    icon: "🚌",
    title: "Bus Services",
    description: "Affordable long-distance travel",
    providers: ["Green Line", "Shyamoli", "Hanif", "Ena Transport"],
    priceRange: "1,000 - 2,500",
  },
  {
    type: "bike" as TransportType,
    icon: "🏍️",
    title: "Ride Sharing",
    description: "Quick local commute",
    services: ["Uber", "Pathao", "Obhai"],
    priceRange: "50 - 500",
  },
  {
    type: "boat" as TransportType,
    icon: "⛵",
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

  const handleBook = (type: TransportType) => {
    setSelectedType(type);
    router.push("/booking");
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
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
              <Text style={styles.searchIcon}>📍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="From"
                placeholderTextColor="#999"
                value={fromLocation}
                onChangeText={setFromLocation}
              />
            </View>
            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchIcon}>🎯</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="To"
                placeholderTextColor="#999"
                value={toLocation}
                onChangeText={setToLocation}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton}>
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
                  <Text style={styles.optionIcon}>{option.icon}</Text>
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
});

import {
  bangladeshDistricts,
  calculateStayPrice,
  roomQualities,
} from "@/constants/bangladeshDistricts";
import { Colors, Radii, Spacing } from "@/constants/design";
import { stays, stayTypes } from "@/constants/staysData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

export default function StaysScreen() {
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [personCount, setPersonCount] = useState(2);
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Filter stays based on type, search query, and district
  const filteredStays = stays.filter((stay) => {
    const matchesType = selectedType === "all" || stay.type === selectedType;
    const matchesSearch =
      !searchQuery ||
      stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict =
      !selectedDistrict ||
      stay.location.toLowerCase().includes(selectedDistrict.toLowerCase());

    return matchesType && matchesSearch && matchesDistrict;
  });

  // Filter districts based on search
  const filteredDistricts = bangladeshDistricts.filter((district) =>
    district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStayCard = ({ item }: { item: (typeof stays)[0] }) => {
    const calculatedPrice = calculateStayPrice(
      item.ratePerDay,
      personCount,
      selectedQuality
    );
    const quality = roomQualities.find((q) => q.id === selectedQuality);

    return (
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
        </View>

        {/* Quality Badge */}
        <View style={styles.qualityBadge}>
          <Ionicons
            name={(quality?.icon as any) || "star"}
            size={12}
            color="#fff"
          />
          <Text style={styles.qualityBadgeText}>{quality?.label}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD34D" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.textSecondary} />
            <Text style={styles.location}>{item.location}</Text>
          </View>

          {/* Capacity & Rate Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <View style={styles.infoLabelRow}>
                <Ionicons
                  name="people"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>
                  {personCount} {personCount === 1 ? "Person" : "People"}
                </Text>
              </View>
              <Text style={styles.infoValue}>Max: {item.capacity}</Text>
            </View>
            <View style={styles.infoPill}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="cash" size={14} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Per Day</Text>
              </View>
              <Text style={styles.infoValue}>
                {item.currency} {calculatedPrice.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Price Breakdown */}
          {(personCount > 2 || selectedQuality !== "standard") && (
            <View style={styles.priceBreakdown}>
              <Text style={styles.priceBreakdownText}>
                Base: {item.currency} {item.ratePerDay.toLocaleString()} ×{" "}
                {quality?.priceMultiplier}x quality
                {personCount > 2 && ` × ${personCount} people`}
              </Text>
            </View>
          )}

          {/* Amenities */}
          <View style={styles.amenitiesContainer}>
            {item.amenities.slice(0, 3).map((amenity: string, idx: number) => (
              <View key={idx} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {item.amenities.length > 3 && (
              <View style={styles.amenityTag}>
                <Text style={styles.amenityText}>
                  +{item.amenities.length - 3}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Book Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              router.push({
                pathname: "/booking",
                params: {
                  type: "stay",
                  propertyName: item.name,
                  propertyType: item.type,
                  location: item.location,
                  personCount: personCount.toString(),
                  roomQuality: selectedQuality,
                  calculatedPrice: calculatedPrice.toString(),
                },
              })
            }
          >
            <Text style={styles.bookButtonText}>
              Book Now - {item.currency} {calculatedPrice.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Find Your Stay</Text>
            <Text style={styles.headerSubtitle}>
              64 Districts • Hotels • Resorts • More
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchToggle}
            onPress={() => setShowSearchBar(!showSearchBar)}
          >
            <Ionicons
              name={showSearchBar ? "close" : "search"}
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar & District Selector */}
        {showSearchBar && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stays or location..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* District Selector */}
            <TouchableOpacity
              style={styles.districtButton}
              onPress={() => setShowDistrictModal(true)}
            >
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.districtButtonText}>
                {selectedDistrict || "All 64 Districts"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Active Filter Chips */}
            {selectedDistrict && (
              <View style={styles.activeFilters}>
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {selectedDistrict}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedDistrict("")}>
                    <Ionicons name="close" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Person Count & Room Quality Selector */}
      <View style={styles.optionsContainer}>
        {/* Person Counter */}
        <View style={styles.personSelector}>
          <View style={styles.selectorHeader}>
            <Ionicons name="people" size={16} color={Colors.primary} />
            <Text style={styles.selectorLabel}>Persons</Text>
          </View>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[
                styles.counterButton,
                personCount <= 1 && styles.counterButtonDisabled,
              ]}
              onPress={() => setPersonCount(Math.max(1, personCount - 1))}
              disabled={personCount <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={personCount <= 1 ? Colors.textMuted : Colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{personCount}</Text>
            <TouchableOpacity
              style={[
                styles.counterButton,
                personCount >= 10 && styles.counterButtonDisabled,
              ]}
              onPress={() => setPersonCount(Math.min(10, personCount + 1))}
              disabled={personCount >= 10}
            >
              <Ionicons
                name="add"
                size={20}
                color={personCount >= 10 ? Colors.textMuted : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Quality Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.qualityScroll}
        >
          {roomQualities.map((quality) => (
            <TouchableOpacity
              key={quality.id}
              style={[
                styles.qualityPill,
                selectedQuality === quality.id && styles.qualityPillActive,
              ]}
              onPress={() => setSelectedQuality(quality.id)}
            >
              <Ionicons
                name={quality.icon as any}
                size={16}
                color={
                  selectedQuality === quality.id
                    ? Colors.primary
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.qualityLabel,
                  selectedQuality === quality.id && styles.qualityLabelActive,
                ]}
              >
                {quality.label}
              </Text>
              <Text style={styles.qualityMultiplier}>
                {quality.priceMultiplier}x
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {stayTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterPill,
              selectedType === type.id && styles.filterPillActive,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={styles.filterIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                selectedType === type.id && styles.filterLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stays List */}
      <FlatList
        data={filteredStays}
        renderItem={renderStayCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No stays found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or search
            </Text>
          </View>
        }
      />

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search districts..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView style={styles.districtList}>
              <TouchableOpacity
                style={styles.districtItem}
                onPress={() => {
                  setSelectedDistrict("");
                  setShowDistrictModal(false);
                }}
              >
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Text
                  style={[
                    styles.districtItemText,
                    !selectedDistrict && styles.districtItemTextActive,
                  ]}
                >
                  All Districts
                </Text>
                {!selectedDistrict && (
                  <Ionicons name="checkmark" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>

              {filteredDistricts.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={styles.districtItem}
                  onPress={() => {
                    setSelectedDistrict(district);
                    setShowDistrictModal(false);
                    setSearchQuery("");
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.districtItemText,
                      selectedDistrict === district &&
                        styles.districtItemTextActive,
                    ]}
                  >
                    {district}
                  </Text>
                  {selectedDistrict === district && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  searchContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },

  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },

  districtButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  districtButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  activeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },

  activeFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },

  optionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },

  personSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: Radii.md,
    padding: Spacing.md,
  },

  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  selectorLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  counterButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  counterValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },

  qualityScroll: {
    flexGrow: 0,
  },

  qualityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginRight: Spacing.sm,
  },

  qualityPillActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: Colors.primary,
  },

  qualityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },

  qualityLabelActive: {
    color: Colors.primary,
  },

  qualityMultiplier: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  filterContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },

  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  filterPillActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: Colors.primary,
  },

  filterIcon: {
    fontSize: 18,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },

  filterLabelActive: {
    color: Colors.primary,
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  card: {
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.background,
  },

  typeBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  qualityBadge: {
    position: "absolute",
    top: Spacing.md + 32,
    left: Spacing.md,
    backgroundColor: "rgba(255, 193, 7, 0.9)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  qualityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  ratingBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  reviewsText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  cardContent: {
    padding: Spacing.lg,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },

  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.md,
  },

  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  infoPill: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  priceBreakdown: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },

  priceBreakdownText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },

  amenitiesContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: Spacing.md,
    flexWrap: "wrap",
  },

  amenityTag: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },

  amenityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34d399",
  },

  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: "center",
  },

  bookButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.sm,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },

  modalContent: {
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
});

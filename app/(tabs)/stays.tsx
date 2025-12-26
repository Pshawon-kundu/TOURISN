import { Colors, Radii, Spacing } from "@/constants/design";
import { stays, stayTypes } from "@/constants/staysData";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaysScreen() {
  const [selectedType, setSelectedType] = useState("all");

  const filteredStays =
    selectedType === "all"
      ? stays
      : stays.filter((stay) => stay.type === (selectedType as any));

  const renderStayCard = ({ item }: { item: (typeof stays)[0] }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
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
              <Ionicons name="people" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Capacity</Text>
            </View>
            <Text style={styles.infoValue}>{item.capacity} people</Text>
          </View>
          <View style={styles.infoPill}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="cash" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Per Day</Text>
            </View>
            <Text style={styles.infoValue}>
              {item.currency} {item.ratePerDay.toLocaleString()}
            </Text>
          </View>
        </View>

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
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Stay</Text>
        <Text style={styles.headerSubtitle}>
          Hotels, Resorts, Camping & More
        </Text>
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
            <Text style={styles.emptyText}>No stays found</Text>
          </View>
        }
      />
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

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
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
  },

  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

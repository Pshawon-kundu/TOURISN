import { Colors, Radii, Spacing } from "@/constants/design";
import {
  experienceCategories,
  experiences,
  type Experience,
} from "@/constants/experiencesData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
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

export default function ExperiencesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "duration">(
    "rating"
  );

  const filteredExperiences = experiences
    .filter((exp) => {
      if (selectedCategory !== "all" && exp.category !== selectedCategory)
        return false;
      if (exp.price < priceRange[0] || exp.price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });

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

  const renderExperienceCard = ({ item }: { item: Experience }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/experience-detail?id=${item.id}`)}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />

        {/* Category Badge */}
        <View style={[styles.badge, { backgroundColor: item.category }]}>
          <Text style={styles.badgeIcon}>
            {experienceCategories.find((c) => c.id === item.category)?.icon}
          </Text>
          <Text style={styles.badgeText}>{item.category.toUpperCase()}</Text>
        </View>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFD34D" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>

        {/* Difficulty Badge */}
        <View
          style={[
            styles.difficultyBadge,
            { borderColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: getDifficultyColor(item.difficulty) },
            ]}
          >
            {item.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={Colors.textSecondary} />
          <Text style={styles.location}>{item.location}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Quick Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="time" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Duration</Text>
            </View>
            <Text style={styles.infoValue}>{item.duration}</Text>
          </View>
          <View style={styles.infoPill}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="people" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Group Size</Text>
            </View>
            <Text style={styles.infoValue}>{item.groupSize}</Text>
          </View>
          <View style={styles.infoPill}>
            <View style={styles.infoLabelRow}>
              <Ionicons
                name="location"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoLabel}>Region</Text>
            </View>
            <Text style={styles.infoValue}>{item.region}</Text>
          </View>
        </View>

        {/* Guide Info */}
        <View style={styles.guideSection}>
          <Image source={{ uri: item.guide.avatar }} style={styles.avatar} />
          <View style={styles.guideInfo}>
            <Text style={styles.guideName}>{item.guide.name}</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.guideDetails}>
                {item.guide.languages.join(", ")}
              </Text>
              <Ionicons name="star" size={14} color="#FFD34D" />
              <Text style={styles.guideDetails}>{item.guide.rating}</Text>
            </View>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsContainer}>
          {item.highlights.slice(0, 3).map((highlight, idx) => (
            <View key={idx} style={styles.highlightTag}>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        {/* Footer - Price & Button */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>
              {item.price.toLocaleString()} {item.currency}
            </Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Experiences</Text>
        <Text style={styles.headerSubtitle}>Create unforgettable memories</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {experienceCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterPill,
              selectedCategory === category.id && styles.filterPillActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.filterIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                selectedCategory === category.id && styles.filterLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === "rating" && styles.sortOptionActive,
          ]}
          onPress={() => setSortBy("rating")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="star"
              size={14}
              color={sortBy === "rating" ? "#fff" : Colors.textSecondary}
            />
            <Text
              style={[
                styles.sortText,
                sortBy === "rating" && styles.sortTextActive,
              ]}
            >
              Top Rated
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === "price" && styles.sortOptionActive,
          ]}
          onPress={() => setSortBy("price")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="pricetag"
              size={14}
              color={sortBy === "price" ? "#fff" : Colors.textSecondary}
            />
            <Text
              style={[
                styles.sortText,
                sortBy === "price" && styles.sortTextActive,
              ]}
            >
              Best Price
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === "duration" && styles.sortOptionActive,
          ]}
          onPress={() => setSortBy("duration")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="time"
              size={14}
              color={sortBy === "duration" ? "#fff" : Colors.textSecondary}
            />
            <Text
              style={[
                styles.sortText,
                sortBy === "duration" && styles.sortTextActive,
              ]}
            >
              Duration
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Experiences List */}
      <FlatList
        data={filteredExperiences}
        renderItem={renderExperienceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="disc" size={28} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No experiences found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
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
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  filterPillActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },

  filterIcon: {
    fontSize: 16,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  filterLabelActive: {
    color: "#fff",
  },

  sortBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },

  sortOption: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
  },

  sortOptionActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },

  sortText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  sortTextActive: {
    color: "#fff",
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  card: {
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
    backgroundColor: "#E5E7EB",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  badge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#667eea",
    opacity: 0.95,
  },

  badgeIcon: {
    fontSize: 14,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },

  ratingBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  reviewsText: {
    fontSize: 10,
    color: "#E5E7EB",
  },

  difficultyBadge: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },

  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
  },

  content: {
    padding: Spacing.lg,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },

  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.md,
  },

  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  infoRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  infoPill: {
    flex: 1,
    backgroundColor: "rgba(102, 126, 234, 0.08)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.15)",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 12,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },

  guideSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  guideInfo: {
    flex: 1,
  },

  guideName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  guideDetails: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },

  highlightTag: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)",
  },

  highlightText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#667eea",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },

  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#667eea",
    marginTop: 2,
  },

  bookButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },

  bookButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

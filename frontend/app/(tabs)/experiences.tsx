import { Colors, Radii, Spacing } from "@/constants/design";
import {
  experienceCategories,
  experiences,
  type Experience,
} from "@/constants/experiencesData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
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

  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    experiences.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.stagger(
        60,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: Platform.OS !== "web",
          })
        )
      ),
    ]).start();
  }, []);

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

  const renderExperienceCard = ({
    item,
    index,
  }: {
    item: Experience;
    index: number;
  }) => (
    <Animated.View
      style={{
        opacity: cardAnims[index],
        transform: [
          {
            scale: cardAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
          {
            translateY: cardAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
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
                <Ionicons
                  name="people"
                  size={14}
                  color={Colors.textSecondary}
                />
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
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Experiences</Text>
        <Text style={styles.headerSubtitle}>
          Create unforgettable memories ✨
        </Text>
      </Animated.View>

      {/* Category Filter */}
      <Animated.View
        style={{
          opacity: filterAnim,
          transform: [
            {
              translateX: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        }}
      >
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
      </Animated.View>

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
        showsVerticalScrollIndicator={false}
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
    backgroundColor: "#0F172A",
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: "transparent",
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  filterPillActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#A78BFA",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  filterIcon: {
    fontSize: 18,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },

  filterLabelActive: {
    color: "#FFFFFF",
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
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },

  sortOptionActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#A78BFA",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  sortText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },

  sortTextActive: {
    color: "#FFFFFF",
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  card: {
    marginBottom: Spacing.lg,
    borderRadius: Radii.xl,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    lineHeight: 26,
    letterSpacing: -0.3,
  },

  location: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
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
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  infoRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  infoPill: {
    flex: 1,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
  },

  guideSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  guideInfo: {
    flex: 1,
  },

  guideName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  guideDetails: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },

  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },

  highlightTag: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.4)",
  },

  highlightText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A78BFA",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  priceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#8B5CF6",
    marginTop: 2,
  },

  bookButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  bookButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  emptyState: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: Spacing.sm,
  },

  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
});

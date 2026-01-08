import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { APIClient } from "@/lib/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_SPACING = 16;

const apiClient = new APIClient();

interface Experience {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: number;
  duration_hours: number;
  rating: number;
  total_reviews: number;
  guide_id: string;
  created_at: string;
}

export default function ExploreScreen() {
  const colors = useThemeColors();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "popular">(
    "popular"
  );

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const categoriesAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: "All", label: "All", icon: "grid", color: "#667eea" },
    { id: "Beach", label: "Beach", icon: "water", color: "#06b6d4" },
    { id: "Adventure", label: "Adventure", icon: "flame", color: "#f97316" },
    { id: "Cultural", label: "Cultural", icon: "book", color: "#8b5cf6" },
    { id: "Nature", label: "Nature", icon: "leaf", color: "#22c55e" },
    { id: "City", label: "City", icon: "business", color: "#6366f1" },
  ];

  const filteredExperiences = experiences
    .filter((exp) => {
      const matchesCategory =
        selectedCategory === "All" || exp.category === selectedCategory;
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "popular") return b.total_reviews - a.total_reviews;
      return 0;
    });

  // Load experiences from backend
  useEffect(() => {
    loadExperiences();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Stagger animations for smooth entrance
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(categoriesAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadExperiences = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await apiClient.getExperiences();
      setExperiences(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load experiences:", err);
      setError("Failed to load experiences");
      // Fall back to mock data with more variety
      setExperiences([
        {
          id: "1",
          title: "Cox's Bazar Beach Tour",
          description: "Longest sea beach in the world",
          category: "Beach",
          location: "Chittagong",
          price: 1500,
          duration_hours: 8,
          rating: 4.8,
          total_reviews: 1240,
          guide_id: "guide1",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Sundarbans Wildlife Safari",
          description: "Explore the largest mangrove forest",
          category: "Adventure",
          location: "Khulna",
          price: 3500,
          duration_hours: 12,
          rating: 4.9,
          total_reviews: 856,
          guide_id: "guide2",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Dhaka Heritage Walk",
          description: "Discover Old Dhaka's rich history",
          category: "Cultural",
          location: "Dhaka",
          price: 800,
          duration_hours: 4,
          rating: 4.6,
          total_reviews: 523,
          guide_id: "guide3",
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          title: "Sylhet Tea Garden Tour",
          description: "Scenic tea estates and natural beauty",
          category: "Nature",
          location: "Sylhet",
          price: 2200,
          duration_hours: 6,
          rating: 4.7,
          total_reviews: 634,
          guide_id: "guide4",
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          title: "Chittagong City Explorer",
          description: "Modern city with coastal charm",
          category: "City",
          location: "Chittagong",
          price: 1200,
          duration_hours: 5,
          rating: 4.5,
          total_reviews: 412,
          guide_id: "guide5",
          created_at: new Date().toISOString(),
        },
        {
          id: "6",
          title: "Saint Martin Island Getaway",
          description: "Pristine coral island paradise",
          category: "Beach",
          location: "Cox's Bazar",
          price: 4500,
          duration_hours: 10,
          rating: 4.9,
          total_reviews: 1102,
          guide_id: "guide6",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadExperiences(true);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderExperienceCard = (
    exp: Experience,
    isLarge: boolean,
    index: number
  ) => {
    const defaultImage =
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=400";

    const cardAnimValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.spring(cardAnimValue, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 3,
      }).start();
    };

    return (
      <Animated.View
        style={{
          opacity: cardAnimValue,
          transform: [
            {
              translateY: cardAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: scaleValue },
          ],
        }}
      >
        <TouchableOpacity
          key={exp.id}
          style={[styles.card, isLarge && styles.largeCard]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() =>
            router.push({
              pathname: "/experience",
              params: { id: exp.id },
            })
          }
          activeOpacity={1}
        >
          {/* Image Container */}
          <Image source={{ uri: defaultImage }} style={styles.image} />

          {/* Overlay with gradient */}
          <View style={styles.overlay} />

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(exp.id);
            }}
          >
            <Ionicons
              name={favorites.has(exp.id) ? "heart" : "heart-outline"}
              size={24}
              color={favorites.has(exp.id) ? "#EF4444" : "#fff"}
            />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            {/* Top Info */}
            <View style={styles.topInfo}>
              <View style={styles.categoryBadge}>
                <Ionicons name="map-outline" size={12} color="#fff" />
                <Text style={styles.categoryText}>{exp.category}</Text>
              </View>
            </View>

            {/* Experience Title */}
            <Text style={styles.name} numberOfLines={2}>
              {exp.title}
            </Text>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.locationText}>{exp.location}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={1}>
              {exp.description}
            </Text>

            {/* Bottom Info Row */}
            <View style={styles.bottomRow}>
              <View style={styles.infoItem}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.infoLabel}>{exp.rating}</Text>
                <Text style={styles.infoValue}>({exp.total_reviews})</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Ionicons name="pricetag" size={14} color="#10B981" />
                <Text style={styles.priceLabel}>৳{exp.price}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSliderCard = (
    exp: Experience,
    index: number,
    scrollX: Animated.Value
  ) => {
    const defaultImage =
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=400";

    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.sliderCard,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/experience",
              params: { id: exp.id },
            })
          }
          activeOpacity={0.9}
        >
          <Image source={{ uri: defaultImage }} style={styles.sliderImage} />
          <View style={styles.sliderOverlay} />

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.sliderFavoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(exp.id);
            }}
          >
            <Ionicons
              name={favorites.has(exp.id) ? "heart" : "heart-outline"}
              size={28}
              color={favorites.has(exp.id) ? "#EF4444" : "#fff"}
            />
          </TouchableOpacity>

          <View style={styles.sliderContent}>
            <View style={styles.sliderBadge}>
              <Ionicons name="sparkles" size={14} color="#F59E0B" />
              <Text style={styles.sliderBadgeText}>FEATURED</Text>
            </View>

            <Text style={styles.sliderTitle} numberOfLines={2}>
              {exp.title}
            </Text>

            <View style={styles.sliderLocationRow}>
              <Ionicons name="location-sharp" size={16} color="#fff" />
              <Text style={styles.sliderLocationText}>{exp.location}</Text>
            </View>

            <View style={styles.sliderBottomRow}>
              <View style={styles.sliderRating}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.sliderRatingText}>{exp.rating}</Text>
                <Text style={styles.sliderReviewsText}>
                  ({exp.total_reviews})
                </Text>
              </View>
              <View style={styles.sliderPrice}>
                <Text style={styles.sliderPriceText}>৳{exp.price}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header with Animation */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Explore Tours</Text>
            <Text style={styles.headerSubtitle}>
              Discover amazing experiences ✨
            </Text>
          </View>
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <View style={styles.headerIcon}>
              <Ionicons name="compass" size={28} color={Colors.primary} />
            </View>
          </Animated.View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tours, locations..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Sort & Filter Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScroll}
        >
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === "popular" && styles.sortChipActive,
            ]}
            onPress={() => setSortBy("popular")}
          >
            <Ionicons
              name="trending-up"
              size={14}
              color={sortBy === "popular" ? "#fff" : Colors.primary}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === "popular" && styles.sortChipTextActive,
              ]}
            >
              Popular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === "rating" && styles.sortChipActive,
            ]}
            onPress={() => setSortBy("rating")}
          >
            <Ionicons
              name="star"
              size={14}
              color={sortBy === "rating" ? "#fff" : Colors.primary}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === "rating" && styles.sortChipTextActive,
              ]}
            >
              Top Rated
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === "price" && styles.sortChipActive,
            ]}
            onPress={() => setSortBy("price")}
          >
            <Ionicons
              name="pricetag"
              size={14}
              color={sortBy === "price" ? "#fff" : Colors.primary}
            />
            <Text
              style={[
                styles.sortChipText,
                sortBy === "price" && styles.sortChipTextActive,
              ]}
            >
              Best Price
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Info Banner with Animation */}
      <Animated.View
        style={[
          styles.bannerContainer,
          {
            opacity: bannerAnim,
            transform: [
              {
                scale: bannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <Ionicons name="rocket" size={32} color="#667eea" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                {experiences.length} Amazing Experiences
              </Text>
              <Text style={styles.bannerDesc}>
                Tap to explore • Swipe to discover more
              </Text>
            </View>
          </View>
          {/* Gradient overlay effect */}
          <View style={styles.bannerGradient} />
        </View>
      </Animated.View>

      {/* Category Filter with Animation */}
      <Animated.View
        style={[
          styles.categoriesContainer,
          {
            opacity: categoriesAnim,
            transform: [
              {
                translateX: categoriesAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.id;
            const categoryCount =
              category.id === "All"
                ? experiences.length
                : experiences.filter((e) => e.category === category.id).length;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                  { borderColor: category.color + "40" },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    {
                      backgroundColor: isSelected
                        ? "#fff"
                        : category.color + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={isSelected ? category.color : category.color}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryCount,
                      isSelected && { color: "#fff" },
                    ]}
                  >
                    {categoryCount} tours
                  </Text>
                </View>
                {isSelected && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading experiences...</Text>
        </View>
      ) : error && experiences.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadExperiences()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View
          style={{
            flex: 1,
            opacity: cardsAnim,
          }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          >
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={20} color="#EF4444" />
                <Text style={styles.statValue}>{favorites.size}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.statValue}>
                  {filteredExperiences.length}
                </Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>

            {/* Featured Experiences - Horizontal Slider */}
            {filteredExperiences.length > 0 && (
              <View style={styles.sliderSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={22} color="#F59E0B" />
                  <Text style={styles.sectionLabel}>Featured Experiences</Text>
                  <Text style={styles.swipeHint}>Swipe →</Text>
                </View>
                <FlatList
                  data={filteredExperiences.slice(0, 5)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_WIDTH + CARD_SPACING}
                  decelerationRate="fast"
                  contentContainerStyle={styles.sliderContainer}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => {
                    const scrollX = useRef(new Animated.Value(0)).current;
                    return renderSliderCard(item, index, scrollX);
                  }}
                />
              </View>
            )}

            {/* All Experiences Grid */}
            {filteredExperiences.length > 1 && (
              <View style={styles.gridSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="grid" size={22} color={Colors.primary} />
                  <Text style={styles.sectionLabel}>All Experiences</Text>
                </View>
                <View style={styles.grid}>
                  {filteredExperiences
                    .slice(1)
                    .map((exp, idx) =>
                      renderExperienceCard(exp, false, idx + 1)
                    )}
                </View>
              </View>
            )}

            {/* No Results */}
            {filteredExperiences.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search"
                  size={64}
                  color={Colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>No experiences found</Text>
                <Text style={styles.emptyDesc}>
                  Try selecting a different category
                </Text>
              </View>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(46, 125, 90, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    height: 50,
    borderWidth: 2,
    borderColor: "rgba(46, 125, 90, 0.1)",
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "500",
  },

  clearButton: {
    padding: Spacing.xs,
  },

  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },

  sortLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },

  sortScroll: {
    flexGrow: 0,
  },

  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: "rgba(46, 125, 90, 0.2)",
    marginRight: Spacing.sm,
  },

  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  sortChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },

  sortChipTextActive: {
    color: "#fff",
  },

  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(102, 126, 234, 0.2)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  bannerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(102, 126, 234, 0.05)",
  },

  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    zIndex: 1,
  },

  bannerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  bannerText: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },

  bannerDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },

  featuredSection: {
    marginBottom: Spacing.xl,
  },

  gridSection: {
    marginBottom: Spacing.xl,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },

  sectionLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  grid: {
    gap: Spacing.lg,
  },

  card: {
    borderRadius: Radii.xl,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    height: 260,
    marginBottom: Spacing.md,
  },

  largeCard: {
    height: 360,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  favoriteButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },

  favoriteIcon: {
    fontSize: 20,
  },

  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xl + 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
  },

  topInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },

  regionBadge: {
    backgroundColor: "rgba(102, 126, 234, 0.9)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backdropFilter: "blur(10px)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  regionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: Spacing.sm,
    lineHeight: 30,
    letterSpacing: -0.5,
  },

  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: Spacing.md,
    lineHeight: 20,
  },

  highlightsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: "wrap",
  },

  highlight: {
    backgroundColor: "rgba(102, 126, 234, 0.7)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backdropFilter: "blur(10px)",
  },

  highlightText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },

  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  infoValue: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: Spacing.lg,
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },

  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },

  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
  },

  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(102, 126, 234, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 4,
  },

  locationText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },

  priceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  categoriesContainer: {
    paddingVertical: Spacing.md,
  },

  categoriesScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    marginRight: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 140,
  },

  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },

  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryChipText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  categoryChipTextActive: {
    color: "#fff",
  },

  categoryCount: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },

  selectedIndicator: {
    position: "absolute",
    bottom: -2,
    left: "50%",
    marginLeft: -15,
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },

  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 90, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: Spacing.md,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
  },

  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Slider Styles
  sliderSection: {
    marginBottom: Spacing.xl,
  },

  swipeHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginLeft: "auto",
    fontStyle: "italic",
  },

  sliderContainer: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingVertical: Spacing.md,
  },

  sliderCard: {
    width: CARD_WIDTH,
    height: 400,
    marginRight: CARD_SPACING,
    borderRadius: Radii.xl,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  sliderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backgroundImage:
      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
  },

  sliderFavoriteButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },

  sliderContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },

  sliderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },

  sliderBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 1,
  },

  sliderTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 34,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  sliderLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  sliderLocationText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  sliderBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },

  sliderRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },

  sliderRatingText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },

  sliderReviewsText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },

  sliderPrice: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },

  sliderPriceText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
});

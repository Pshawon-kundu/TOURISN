import { Radii, Spacing } from "@/constants/design";
import { stays, stayTypes } from "@/constants/staysData";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const colors = useThemeColors();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(stays.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(filterAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
      Animated.stagger(
        80,
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

  const filteredStays = stays.filter((stay) => {
    const matchesType = selectedType === "all" || stay.type === selectedType;
    const matchesSearch =
      stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderStayCard = ({
    item,
    index,
  }: {
    item: (typeof stays)[0];
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
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        {/* Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FCD34D" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.location}>{item.location}</Text>
          </View>

          {/* Capacity & Rate Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <View style={styles.infoLabelRow}>
                <Ionicons
                  name="people"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoLabel}>Capacity</Text>
              </View>
              <Text style={styles.infoValue}>{item.capacity} people</Text>
            </View>
            <View style={styles.infoPill}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="cash" size={14} color={colors.textSecondary} />
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
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => {
              // Navigate to trip detail page with stay information
              router.push({
                pathname: "/trip-detail",
                params: {
                  id: item.id,
                  name: item.name,
                  location: item.location,
                  image: item.image,
                  rating: item.rating.toString(),
                  price: item.ratePerDay.toString(),
                  currency: item.currency,
                  type: item.type,
                  capacity: item.capacity.toString(),
                  description: item.description,
                },
              });
            }}
          >
            <Text style={styles.bookButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Header with Back Button */}
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
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Find Your Stay
            </Text>
            <View style={styles.headerSubtitleRow}>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                Hotels, Resorts, Camping & More
              </Text>
              <Ionicons name="bed" size={16} color={colors.primary} />
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: showDashboard
                    ? colors.primary
                    : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setShowDashboard(!showDashboard)}
            >
              <Ionicons
                name={showDashboard ? "list-outline" : "analytics-outline"}
                size={20}
                color={showDashboard ? "white" : colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.favButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="heart-outline"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search stays, locations..."
            placeholderTextColor={colors.textSecondary}
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
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Filter Pills with Animation */}
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
          {stayTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    selectedType === type.id ? colors.primary : colors.surface,
                  borderColor:
                    selectedType === type.id ? colors.primary : colors.border,
                },
                selectedType === type.id && styles.filterPillActive,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={18}
                color={selectedType === type.id ? "#fff" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterLabel,
                  {
                    color:
                      selectedType === type.id ? "#fff" : colors.textPrimary,
                  },
                  selectedType === type.id && styles.filterLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Stays List with Animation */}
      <Animated.View
        style={{
          flex: 1,
          opacity: listAnim,
        }}
      >
        <FlatList
          data={filteredStays}
          renderItem={renderStayCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={() =>
            showDashboard ? (
              <RealTimeStaysDashboard
                showHeader={false}
                maxItems={5}
                onBookingPress={(bookingId) => {
                  console.log("Booking pressed:", bookingId);
                }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bed-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                No stays found
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Try a different category
              </Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    backgroundColor: "transparent",
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
  },

  favButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    height: 50,
    borderWidth: 1,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  clearButton: {
    padding: Spacing.xs,
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
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  filterPillActive: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  filterIcon: {
    fontSize: 20,
  },

  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
  },

  filterLabelActive: {
    // Active styles applied via inline color
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

  cardImage: {
    width: "100%",
    height: 220,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },

  typeBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: "rgba(59, 130, 246, 0.95)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.md,
    backdropFilter: "blur(10px)",
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  ratingBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backdropFilter: "blur(10px)",
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FCD34D",
  },

  reviewsText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },

  cardContent: {
    padding: Spacing.lg,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
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

  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  infoPill: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  infoLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
    fontWeight: "600",
  },

  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  amenitiesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.md,
    flexWrap: "wrap",
  },

  amenityTag: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
  },

  amenityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34D399",
  },

  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  bookButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  bookButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  emptyState: {
    paddingVertical: Spacing.xxl * 2,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: Spacing.md,
  },

  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: Spacing.xs,
  },

  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

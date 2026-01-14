import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { districts } from "@/constants/bangladeshDistrictsData";
import { Radii, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function DistrictDetailScreen() {
  const { id } = useLocalSearchParams();
  const district = districts.find((d) => d.id === id);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  if (!district) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorText}>District not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [0, -IMAGE_HEIGHT / 2],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", "#fff"],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: "rgba(255, 255, 255, 0.9)" },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.headerTitle,
            {
              opacity: headerOpacity,
            },
          ]}
        >
          {district.name}
        </Animated.Text>

        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: "rgba(255, 255, 255, 0.9)" },
          ]}
        >
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== "web" }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { translateY: imageTranslate },
                { scale: imageScale },
              ],
            },
          ]}
        >
          <Image source={{ uri: district.image }} style={styles.heroImage} />
          <View style={styles.imageOverlay} />

          {/* Division Badge */}
          <View style={styles.divisionBadge}>
            <Ionicons name="location" size={18} color="#fff" />
            <Text style={styles.divisionText}>
              {district.division} Division
            </Text>
          </View>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.ratingText}>{district.rating}</Text>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.districtName}>{district.name}</Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Coordinates Info */}
          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={18} color="#667eea" />
            <Text style={styles.coordinatesText}>
              {district.coordinates.lat.toFixed(4)}°N,{" "}
              {district.coordinates.lng.toFixed(4)}°E
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>About {district.name}</Text>
            </View>
            <Text style={styles.description}>{district.description}</Text>
          </View>

          {/* Famous Places */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="compass" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>
                Famous Places ({district.famousPlaces.length})
              </Text>
            </View>
            <View style={styles.placesGrid}>
              {district.famousPlaces.map((place, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.placeCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.placeIconContainer}>
                    <Ionicons name="location" size={24} color="#667eea" />
                  </View>
                  <Text style={styles.placeName}>{place}</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color="#9CA3AF"
                    style={styles.placeArrow}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Famous Foods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={24} color="#F59E0B" />
              <Text style={styles.sectionTitle}>
                Famous Foods ({district.famousFoods.length})
              </Text>
            </View>
            <View style={styles.foodsGrid}>
              {district.famousFoods.map((food, index) => (
                <View key={index} style={styles.foodCard}>
                  <View style={styles.foodIconContainer}>
                    <Ionicons name="fast-food" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.foodName}>{food}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart" size={24} color="#10B981" />
              <Text style={styles.sectionTitle}>Quick Stats</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Ionicons name="map" size={28} color="#667eea" />
                </View>
                <Text style={styles.statValue}>
                  {district.famousPlaces.length}
                </Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="restaurant" size={28} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>
                  {district.famousFoods.length}
                </Text>
                <Text style={styles.statLabel}>Foods</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
                  <Ionicons name="star" size={28} color="#EF4444" />
                </View>
                <Text style={styles.statValue}>{district.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                router.push({
                  pathname: "/guides" as any,
                  params: { location: district.name },
                });
              }}
            >
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Find Local Guides</Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtons}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="map-outline" size={20} color="#667eea" />
                <Text style={styles.secondaryButtonText}>View Map</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" />
                <Text style={styles.secondaryButtonText}>Plan Trip</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nearby Districts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="navigate-circle" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Nearby Districts</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.nearbyScroll}
            >
              {districts
                .filter(
                  (d) =>
                    d.division === district.division && d.id !== district.id
                )
                .slice(0, 5)
                .map((nearbyDistrict) => (
                  <TouchableOpacity
                    key={nearbyDistrict.id}
                    style={styles.nearbyCard}
                    onPress={() => {
                      router.push({
                        pathname: "/district-detail" as any,
                        params: { id: nearbyDistrict.id },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: nearbyDistrict.image }}
                      style={styles.nearbyImage}
                    />
                    <View style={styles.nearbyOverlay}>
                      <Text style={styles.nearbyName} numberOfLines={1}>
                        {nearbyDistrict.name}
                      </Text>
                      <View style={styles.nearbyRating}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.nearbyRatingText}>
                          {nearbyDistrict.rating}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  divisionBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  divisionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  ratingBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    right: Spacing.md,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  districtName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1F2937",
    flex: 1,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.lg,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: "#4B5563",
    backgroundColor: "#fff",
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placesGrid: {
    gap: Spacing.sm,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: Spacing.md,
    borderRadius: Radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.sm,
  },
  placeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  placeName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeArrow: {
    marginLeft: Spacing.sm,
  },
  foodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  foodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  foodName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionSection: {
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: Spacing.lg,
    borderRadius: Radii.lg,
    gap: 12,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    gap: 8,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  nearbyScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  nearbyCard: {
    width: 160,
    marginRight: Spacing.md,
    borderRadius: Radii.lg,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nearbyImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  nearbyOverlay: {
    padding: Spacing.sm,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  nearbyRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nearbyRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

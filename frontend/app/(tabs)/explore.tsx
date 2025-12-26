import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

interface Destination {
  id: string;
  name: string;
  region: string;
  imageUrl: string;
  icon: string;
  iconType: "ionicons" | "material";
  description: string;
  highlights: string[];
  bestTime: string;
  rating: number;
  reviews: number;
}

const DESTINATIONS: Destination[] = [
  {
    id: "cox",
    name: "Cox's Bazar Beach",
    region: "Chittagong",
    imageUrl:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/b8/40/3b/cox-s-bazar-sea-beach.jpg?w=600&h=400&s=1",
    icon: "water",
    iconType: "ionicons",
    description: "Longest sea beach in the world",
    highlights: ["Beach surfing", "Water sports", "Seafood", "Sunset views"],
    bestTime: "Oct - Feb",
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: "bandarban",
    name: "Bandarban Hills",
    region: "Hill Tracts",
    imageUrl:
      "https://www.travelmate.com.bd/wp-content/uploads/2020/12/Bandarban-Tour.jpg",
    icon: "terrain",
    iconType: "ionicons",
    description: "Tribal villages & scenic trails",
    highlights: ["Trekking", "Tribal culture", "Waterfalls", "Mountain views"],
    bestTime: "Nov - Feb",
    rating: 4.9,
    reviews: 856,
  },
  {
    id: "sylhet",
    name: "Sylhet Tea Gardens",
    region: "Northeast",
    imageUrl:
      "https://www.travelmate.com.bd/wp-content/uploads/2019/11/Sylhet-Tour-Package.jpg",
    icon: "leaf",
    iconType: "ionicons",
    description: "Verdant tea plantations",
    highlights: ["Tea tours", "Photography", "Nature walks", "Local cuisine"],
    bestTime: "All year",
    rating: 4.7,
    reviews: 632,
  },
  {
    id: "sajek",
    name: "Sajek Valley",
    region: "Hill Tracts",
    imageUrl:
      "https://www.tbsnews.net/sites/default/files/styles/big_3/public/images/2021/11/10/sajek.jpg",
    icon: "partly-sunny",
    iconType: "ionicons",
    description: "Misty mountains & camping",
    highlights: ["Stargazing", "Camping", "Sunrise trek", "Bonfire"],
    bestTime: "Dec - Jan",
    rating: 4.9,
    reviews: 512,
  },
  {
    id: "dhaka",
    name: "Historic Dhaka",
    region: "Central",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Lalbagh_Fort%2C_Dhaka.jpg/1200px-Lalbagh_Fort%2C_Dhaka.jpg",
    icon: "business",
    iconType: "ionicons",
    description: "Ancient capital with rich heritage",
    highlights: ["Old city", "Mosques", "Street food", "Museums"],
    bestTime: "Oct - Mar",
    rating: 4.6,
    reviews: 2150,
  },
  {
    id: "sundarbans",
    name: "Sundarbans Mangrove",
    region: "Khulna",
    imageUrl:
      "https://www.travelmate.com.bd/wp-content/uploads/2019/11/Sundarban-Tour.jpg",
    icon: "paw",
    iconType: "ionicons",
    description: "Tiger safari & UNESCO site",
    highlights: ["Tiger spotting", "Wildlife", "Boat tours", "Photography"],
    bestTime: "Nov - Feb",
    rating: 4.9,
    reviews: 745,
  },
];

export default function ExploreScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  const renderDestinationCard = (dest: Destination, isLarge: boolean) => (
    <TouchableOpacity
      key={dest.id}
      style={[styles.card, isLarge && styles.largeCard]}
      onPress={() => router.push("/experience")}
    >
      {/* Image Container */}
      <Image source={{ uri: dest.imageUrl }} style={styles.image} />

      {/* Overlay with gradient */}
      <View style={styles.overlay} />

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(dest.id);
        }}
      >
        <Ionicons
          name={favorites.has(dest.id) ? "heart" : "heart-outline"}
          size={24}
          color={favorites.has(dest.id) ? "#EF4444" : "#fff"}
        />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Info */}
        <View style={styles.topInfo}>
          <View style={styles.iconContainer}>
            {dest.iconType === "ionicons" ? (
              <Ionicons name={dest.icon as any} size={24} color="#667eea" />
            ) : (
              <MaterialCommunityIcons
                name={dest.icon as any}
                size={24}
                color="#667eea"
              />
            )}
          </View>
          <View style={styles.regionBadge}>
            <Ionicons name="location" size={12} color="#fff" />
            <Text style={styles.regionText}>{dest.region}</Text>
          </View>
        </View>

        {/* Destination Name */}
        <Text style={styles.name} numberOfLines={2}>
          {dest.name}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={1}>
          {dest.description}
        </Text>

        {/* Highlights */}
        <View style={styles.highlightsRow}>
          {dest.highlights.slice(0, 2).map((highlight, idx) => (
            <View key={idx} style={styles.highlight}>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Info Row */}
        <View style={styles.bottomRow}>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.infoLabel}>{dest.rating}</Text>
            <Text style={styles.infoValue}>({dest.reviews})</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={14} color="#667eea" />
            <Text style={styles.infoLabel}>{dest.bestTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Bangladesh</Text>
        <Text style={styles.headerSubtitle}>Discover amazing destinations</Text>
      </View>

      {/* Info Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <Ionicons name="rocket" size={32} color="#667eea" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>6 Amazing Destinations</Text>
              <Text style={styles.bannerDesc}>
                Tap a card to explore or save to favorites
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Destination */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionLabel}>Featured</Text>
          {renderDestinationCard(DESTINATIONS[0], true)}
        </View>

        {/* All Destinations Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionLabel}>Popular Destinations</Text>
          <View style={styles.grid}>
            {DESTINATIONS.slice(1).map((dest) =>
              renderDestinationCard(dest, false)
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(102, 126, 234, 0.08)",
    borderBottomLeftRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
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

  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  banner: {
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: Radii.lg,
    overflow: "hidden",
  },

  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },

  bannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  bannerText: {
    flex: 1,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  bannerDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  featuredSection: {
    marginBottom: Spacing.xl,
  },

  gridSection: {
    marginBottom: Spacing.xl,
  },

  sectionLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },

  grid: {
    gap: Spacing.lg,
  },

  card: {
    borderRadius: Radii.lg,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    height: 240,
  },

  largeCard: {
    height: 320,
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },

  favoriteButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },

  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: Spacing.md,
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
});

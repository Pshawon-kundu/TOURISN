import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  districts,
  divisions,
  type District,
} from "@/constants/bangladeshDistrictsData";
import { Radii, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDistricts, setFilteredDistricts] =
    useState<District[]>(districts);
  const [searchSuggestions, setSearchSuggestions] = useState<District[]>([]);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  useEffect(() => {
    filterDistricts();
  }, [searchQuery, selectedDivision]);

  const filterDistricts = () => {
    let filtered = districts;

    if (selectedDivision !== "All") {
      filtered = filtered.filter((d) => d.division === selectedDivision);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.division.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.famousPlaces.some((p) => p.toLowerCase().includes(query)) ||
          d.famousFoods.some((f) => f.toLowerCase().includes(query))
      );
    }

    setFilteredDistricts(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      const suggestions = districts
        .filter((d) => d.name.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 8);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }
  };

  const handleSelectSuggestion = (district: District) => {
    setSearchQuery(district.name);
    setShowSuggestions(false);
  };

  const renderDistrictCard = ({
    item,
    index,
  }: {
    item: District;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to district detail
        router.push({
          pathname: "/district-detail" as any,
          params: { id: item.id },
        });
      }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Overlay Badge */}
      <View style={styles.divisionBadge}>
        <Ionicons name="location" size={14} color="#fff" />
        <Text style={styles.divisionText}>{item.division}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.districtName}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Famous Places */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="compass" size={16} color="#667eea" />
            <Text style={styles.infoTitle}>Famous Places</Text>
          </View>
          <View style={styles.tagContainer}>
            {item.famousPlaces.slice(0, 3).map((place, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{place}</Text>
              </View>
            ))}
            {item.famousPlaces.length > 3 && (
              <View style={[styles.tag, styles.tagMore]}>
                <Text style={styles.tagText}>
                  +{item.famousPlaces.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Famous Foods */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="restaurant" size={16} color="#F59E0B" />
            <Text style={styles.infoTitle}>Famous Foods</Text>
          </View>
          <View style={styles.tagContainer}>
            {item.famousFoods.slice(0, 3).map((food, idx) => (
              <View key={idx} style={[styles.tag, styles.foodTag]}>
                <Text style={styles.tagText}>{food}</Text>
              </View>
            ))}
            {item.famousFoods.length > 3 && (
              <View style={[styles.tag, styles.tagMore]}>
                <Text style={styles.tagText}>
                  +{item.famousFoods.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Explore District</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Explore</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.headerSubtitle}>
                Create unforgettable memories
              </Text>
              <Ionicons name="sparkles" size={16} color="#F59E0B" />
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={24} color="#1F2937" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tours, locations..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
            >
              {searchSuggestions.map((district) => (
                <TouchableOpacity
                  key={district.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(district)}
                >
                  <Ionicons name="location" size={16} color="#667eea" />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionName}>{district.name}</Text>
                    <Text style={styles.suggestionDivision}>
                      {district.division} Division
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Division Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Sort by:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {divisions.map((division) => (
            <TouchableOpacity
              key={division}
              style={[
                styles.filterChip,
                selectedDivision === division && styles.filterChipActive,
              ]}
              onPress={() => setSelectedDivision(division)}
            >
              {division === "All" ? (
                <Ionicons
                  name="grid"
                  size={16}
                  color={selectedDivision === division ? "#fff" : "#667eea"}
                />
              ) : (
                <Ionicons
                  name="location"
                  size={16}
                  color={selectedDivision === division ? "#fff" : "#667eea"}
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  selectedDivision === division && styles.filterChipTextActive,
                ]}
              >
                {division}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="grid" size={20} color="#667eea" />
          <Text style={styles.statNumber}>{filteredDistricts.length}</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="location" size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>
            {filteredDistricts.reduce(
              (sum, d) => sum + d.famousPlaces.length,
              0
            )}
          </Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="star" size={20} color="#EAB308" />
          <Text style={styles.statNumber}>
            {(
              filteredDistricts.reduce((sum, d) => sum + d.rating, 0) /
                filteredDistricts.length || 0
            ).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Districts List */}
      <FlatList
        data={filteredDistricts}
        renderItem={renderDistrictCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No districts found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#fff",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },

  clearButton: {
    padding: Spacing.xs,
  },

  suggestionsContainer: {
    marginTop: Spacing.sm,
    backgroundColor: "#fff",
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  suggestionsList: {
    maxHeight: 300,
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: Spacing.sm,
  },

  suggestionText: {
    flex: 1,
  },

  suggestionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },

  suggestionDivision: {
    fontSize: 12,
    color: "#6B7280",
  },

  filterSection: {
    paddingTop: Spacing.md,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: Radii.full,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  filterChipActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },

  filterChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  filterChipTextActive: {
    color: "#fff",
  },

  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: Radii.lg,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1F2937",
    marginTop: Spacing.xs,
  },

  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },

  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: Radii.xl,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },

  divisionBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(102, 126, 234, 0.95)",
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.md,
  },

  divisionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  cardContent: {
    padding: Spacing.lg,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  districtName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F2937",
    flex: 1,
  },

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },

  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  infoSection: {
    marginBottom: Spacing.md,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },

  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  foodTag: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },

  tagMore: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },

  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },

  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#667eea",
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    marginTop: Spacing.sm,
  },

  exploreButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: Spacing.md,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: Spacing.xs,
  },
});

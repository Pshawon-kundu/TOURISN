import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, ColorSchemes, Radii, Spacing } from "@/constants/design";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { APIClient } from "@/lib/api";

const apiClient = new APIClient();

interface SavedPlace {
  id: string;
  place_type: string;
  place_id: string;
  place_name: string;
  place_image?: string;
  place_location?: string;
  created_at: string;
}

export default function SavedPlacesScreen() {
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const colorScheme = useColorScheme() ?? "light";
  const colors = ColorSchemes[colorScheme];

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = async () => {
    try {
      setLoading(true);
      const result = await apiClient.request({
        method: "GET",
        endpoint: "/profile/saved",
      });
      if (result.success && result.savedPlaces) {
        setSavedPlaces(result.savedPlaces);
      }
    } catch (error) {
      console.error("Failed to load saved places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    Alert.alert("Remove Place", "Are you sure you want to remove this place?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.request({
              method: "DELETE",
              endpoint: `/profile/saved/${id}`,
            });
            setSavedPlaces(savedPlaces.filter((p) => p.id !== id));
          } catch (error) {
            Alert.alert("Error", "Failed to remove place");
          }
        },
      },
    ]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stay":
        return "bed";
      case "experience":
        return "compass";
      case "transport":
        return "car";
      case "guide":
        return "person";
      default:
        return "bookmark";
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Saved Places
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading saved places...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {savedPlaces.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                No saved places yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Start exploring and save your favorite places
              </Text>
              <TouchableOpacity
                style={[
                  styles.exploreButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.countText, { color: colors.textPrimary }]}>
                {savedPlaces.length} place{savedPlaces.length !== 1 ? "s" : ""}{" "}
                saved
              </Text>
              {savedPlaces.map((place) => (
                <View
                  key={place.id}
                  style={[
                    styles.placeCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <View style={styles.placeImageContainer}>
                    {place.place_image ? (
                      <Image
                        source={{ uri: place.place_image }}
                        style={styles.placeImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.placeholderImage,
                          {
                            backgroundColor:
                              colorScheme === "dark" ? "#334155" : "#F3F4F6",
                          },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(place.place_type) as any}
                          size={32}
                          color={colors.textMuted}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.placeInfo}>
                    <View style={styles.placeHeader}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              colorScheme === "dark"
                                ? "rgba(59, 130, 246, 0.1)"
                                : "#EFF6FF",
                          },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(place.place_type) as any}
                          size={12}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.typeBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          {place.place_type}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.placeName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {place.place_name}
                      </Text>
                    </View>
                    {place.place_location && (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.locationText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {place.place_location}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[styles.savedDate, { color: colors.textMuted }]}
                    >
                      Saved {new Date(place.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(place.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    padding: Spacing.lg,
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    marginTop: Spacing.xl,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  placeCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.md,
    overflow: "hidden",
    marginRight: Spacing.md,
  },
  placeImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  placeInfo: {
    flex: 1,
  },
  placeHeader: {
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
    textTransform: "capitalize",
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  savedDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  removeButton: {
    padding: Spacing.sm,
    alignSelf: "flex-start",
  },
});

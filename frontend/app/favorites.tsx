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
import { Colors, Radii, Spacing } from "@/constants/design";
import { APIClient } from "@/lib/api";

const apiClient = new APIClient();

interface Favorite {
  id: string;
  item_type: string;
  item_id: string;
  item_name: string;
  item_image?: string;
  created_at: string;
}

export default function FavoritesScreen() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const result = await apiClient.request({
        method: "GET",
        endpoint: "/profile/favorites",
      });
      if (result.success && result.favorites) {
        setFavorites(result.favorites);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this from favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.request({
                method: "DELETE",
                endpoint: `/profile/favorites/${id}`,
              });
              setFavorites(favorites.filter((f) => f.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to remove favorite");
            }
          },
        },
      ]
    );
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
        return "heart";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "stay":
        return "#3B82F6";
      case "experience":
        return "#10B981";
      case "transport":
        return "#F59E0B";
      case "guide":
        return "#8B5CF6";
      default:
        return Colors.primary;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#EF4444" />
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySubtext}>
                Add items to favorites to see them here
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.exploreButtonText}>Start Exploring</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.countText}>
                {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
              </Text>
              {favorites.map((favorite) => (
                <View key={favorite.id} style={styles.favoriteCard}>
                  <View style={styles.favoriteImageContainer}>
                    {favorite.item_image ? (
                      <Image
                        source={{ uri: favorite.item_image }}
                        style={styles.favoriteImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.placeholderImage,
                          {
                            backgroundColor: `${getTypeColor(
                              favorite.item_type
                            )}15`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(favorite.item_type) as any}
                          size={32}
                          color={getTypeColor(favorite.item_type)}
                        />
                      </View>
                    )}
                    <View style={styles.heartBadge}>
                      <Ionicons name="heart" size={16} color="#EF4444" />
                    </View>
                  </View>
                  <View style={styles.favoriteInfo}>
                    <View style={styles.favoriteHeader}>
                      <View
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor: `${getTypeColor(
                              favorite.item_type
                            )}15`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(favorite.item_type) as any}
                          size={12}
                          color={getTypeColor(favorite.item_type)}
                        />
                        <Text
                          style={[
                            styles.typeChipText,
                            { color: getTypeColor(favorite.item_type) },
                          ]}
                        >
                          {favorite.item_type}
                        </Text>
                      </View>
                      <Text style={styles.favoriteName}>
                        {favorite.item_name}
                      </Text>
                    </View>
                    <Text style={styles.addedDate}>
                      Added {new Date(favorite.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(favorite.id)}
                  >
                    <Ionicons name="heart-dislike" size={20} color="#EF4444" />
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
    backgroundColor: "#EF4444",
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
  favoriteCard: {
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
  favoriteImageContainer: {
    width: 80,
    height: 80,
    borderRadius: Radii.md,
    overflow: "hidden",
    marginRight: Spacing.md,
    position: "relative",
  },
  favoriteImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#fff",
    borderRadius: Radii.full,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteHeader: {
    marginBottom: Spacing.xs,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  addedDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  removeButton: {
    padding: Spacing.sm,
    alignSelf: "flex-start",
  },
});

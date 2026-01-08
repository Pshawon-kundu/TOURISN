/* eslint-disable import/no-unresolved */

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Guide {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  rating: number;
  totalReviews: number;
  isOnline: boolean;
  lastSeen: string | null;
}

export default function ChatListScreen() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const fetchGuides = async () => {
    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5001";
      const response = await fetch(`${backendUrl}/api/guides/with-status`);
      const data = await response.json();

      if (data.success) {
        setGuides(data.data);
        setFilteredGuides(data.data);
      }
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuides();

    // Refresh guide status every 30 seconds
    const interval = setInterval(fetchGuides, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter(
        (guide) =>
          guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.specialties.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          guide.languages.some((l) =>
            l.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredGuides(filtered);
    }
  }, [searchQuery, guides]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuides();
  };

  const openChat = (guide: Guide) => {
    router.push({
      pathname: "/chat-room",
      params: {
        guideId: guide.id,
        guideName: guide.name,
      },
    });
  };

  const renderGuide = ({ item }: { item: Guide }) => {
    const lastSeenText = item.isOnline
      ? "Active now"
      : item.lastSeen
      ? `Last seen ${getTimeAgo(item.lastSeen)}`
      : "Offline";

    return (
      <TouchableOpacity
        style={styles.guideCard}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusDot,
              item.isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          />
        </View>

        <View style={styles.guideInfo}>
          <View style={styles.guideHeader}>
            <Text style={styles.guideName}>{item.name}</Text>
            {item.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.guideStatus} numberOfLines={1}>
            {lastSeenText}
          </Text>

          {item.specialties.length > 0 && (
            <Text style={styles.guideSpecialties} numberOfLines={1}>
              {item.specialties.slice(0, 2).join(", ")}
            </Text>
          )}

          <View style={styles.languageContainer}>
            {item.languages.slice(0, 3).map((lang, idx) => (
              <View key={idx} style={styles.languageChip}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading guides...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {filteredGuides.filter((g) => g.isOnline).length} guides online
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="rgba(255,255,255,0.5)"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      {filteredGuides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>
            {searchQuery ? "No guides found" : "No guides available"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? "Try a different search term"
              : "Check back later for available guides"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGuides}
          renderItem={renderGuide}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  statusOnline: {
    backgroundColor: "#10B981",
  },
  statusOffline: {
    backgroundColor: "#6B7280",
  },
  guideInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: Radii.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },
  guideStatus: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    marginBottom: 4,
  },
  guideSpecialties: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    marginBottom: 6,
  },
  languageContainer: {
    flexDirection: "row",
    gap: 6,
  },
  languageChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  languageText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3B82F6",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
    textAlign: "center",
  },
});

import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { APIClient } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
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

const apiClient = new APIClient();

interface GuideDetail {
  id: string;
  bio: string;
  specialties: string[];
  languages: string[];
  years_of_experience: number;
  certifications: string[];
  nid_number: string;
  nid_image_url: string;
  age: number;
  expertise_area: string;
  per_hour_rate: number;
  expertise_categories: string[];
  coverage_areas: string[];
  is_verified: boolean;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  profile_image_url?: string;
}

export default function GuideProfile() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [isNavigating, setIsNavigating] = useState(false);
  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchGuide = async () => {
      try {
        const result: any = await apiClient.get(`/guides/${id}`);
        if (result && result.success) {
          setGuide(result.data);
        } else if (result && result.user) {
          // Handle direct return if schema matches
          setGuide(result);
        } else if (result) {
          setGuide(result);
        }
      } catch (e) {
        console.error("Failed to load guide", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const handleChatPress = async () => {
    if (isNavigating) return;
    setIsNavigating(true);

    try {
      router.push({
        pathname: "/chat-room",
        params: {
          guideId: id,
          guideName: guide
            ? `${guide.user.first_name} ${guide.user.last_name || ""}`
            : "Guide",
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert(
        "Chat Unavailable",
        "Failed to open chat. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleBookPress = () => {
    if (!guide) return;
    router.push({
      pathname: "/guide-booking",
      params: {
        guideId: guide.id,
        guideName: `${guide.user.first_name} ${guide.user.last_name || ""}`,
        rate: `৳${guide.per_hour_rate || 500}`,
        photo: guide.profile_image_url,
      },
    });
  };

  if (loading) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </ThemedView>
    );
  }

  if (!guide) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Guide Profile" />
        <View style={{ padding: 20 }}>
          <Text>Guide not found</Text>
        </View>
      </ThemedView>
    );
  }

  const fullName =
    `${guide.user?.first_name || ""} ${guide.user?.last_name || ""}`.trim() ||
    "Local Guide";
  const specialties = Array.isArray(guide.specialties)
    ? guide.specialties.join(", ")
    : guide.specialties;
  const languages = Array.isArray(guide.languages)
    ? guide.languages.join(", ")
    : guide.languages;
  const expertise = Array.isArray(guide.expertise_categories)
    ? guide.expertise_categories.join(", ")
    : guide.expertise_categories;
  const coverage = Array.isArray(guide.coverage_areas)
    ? guide.coverage_areas.join(", ")
    : guide.coverage_areas;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Guide profile" }} />
      <Header title="Guide profile" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header with Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  guide.profile_image_url ||
                  `https://ui-avatars.com/api/?name=${fullName}&background=3B82F6&color=fff&size=120&bold=true`,
              }}
              style={styles.avatar}
            />
            {guide.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
            )}
          </View>
          <Text style={styles.guideName}>{fullName}</Text>
          <Text style={styles.guideSubtitle}>
            {guide.expertise_area || "Professional Guide"}
          </Text>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesRow}>
          {guide.is_verified && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Ionicons name="language" size={16} color="#3B82F6" />
            <Text style={styles.badgeText}>{languages || "Bangla"}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="time" size={16} color="#8B5CF6" />
            <Text style={styles.badgeText}>
              {guide.years_of_experience}y Exp
            </Text>
          </View>
        </View>

        {/* About Section - Using Bio from Registration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.sectionContent}>
            {guide.bio || "No bio available."}
          </Text>
          {/* Detailed Expertise */}
          <View style={{ marginTop: 12, gap: 4 }}>
            <Text style={{ fontWeight: "600", color: "#4B5563" }}>
              Expertise:
            </Text>
            <Text style={{ color: "#6B7280" }}>{expertise}</Text>
          </View>
          <View style={{ marginTop: 8, gap: 4 }}>
            <Text style={{ fontWeight: "600", color: "#4B5563" }}>
              Coverage:
            </Text>
            <Text style={{ color: "#6B7280" }}>{coverage}</Text>
          </View>
        </View>

        {/* Rates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Rates</Text>
          </View>
          <View style={styles.ratesContainer}>
            <View style={styles.rateItem}>
              <Ionicons name="sunny-outline" size={18} color="#F59E0B" />
              <Text style={styles.rateText}>
                BDT {guide.per_hour_rate} / hour
              </Text>
            </View>
            <View style={styles.rateItem}>
              <Ionicons name="sunny" size={18} color="#F59E0B" />
              <Text style={styles.rateText}>
                BDT {(guide.per_hour_rate || 500) * 8} / full-day (approx)
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Info from Registration (Certifications/NID status) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Credentials</Text>
          </View>
          <View style={{ gap: 8 }}>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color="#64748B" />
              <Text style={styles.sectionContent}>
                NID Verified: {guide.nid_number ? "Yes" : "Pending"}
              </Text>
            </View>
            {guide.certifications && guide.certifications.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="medal-outline" size={18} color="#64748B" />
                <Text style={styles.sectionContent}>
                  Certifications:{" "}
                  {Array.isArray(guide.certifications)
                    ? guide.certifications.join(", ")
                    : guide.certifications}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <Text style={styles.sectionContent}>Age: {guide.age} years</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.chatButton, isNavigating && styles.buttonDisabled]}
            onPress={handleChatPress}
            disabled={isNavigating}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            <Text style={styles.chatButtonText}>Chat Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPress}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Book Guide</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, gap: 16 },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 2,
  },
  guideName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  guideSubtitle: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },

  // Badges
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  // Sections
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Rates
  ratesContainer: {
    gap: 10,
  },
  rateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
  },
  rateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Link
  linkText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

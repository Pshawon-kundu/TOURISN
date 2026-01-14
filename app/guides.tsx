import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const guideCategories = [
  "All",
  "Beach",
  "Hills",
  "City",
  "Culture",
  "Food",
  "Adventure",
] as const;

interface Guide {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  price: string;
  specialty: string;
  languages: string;
  badge: string;
  category: string;
  photo: string;
  isVerified: boolean;
  status: string;
  yearsExperience: number;
  bio: string;
  isAvailable: boolean;
  perHourRate: number;
  expertiseCategories: string[];
  coverageAreas: string[];
  phone: string;
  email: string;
}

export default function GuidesScreen() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuides = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const baseUrl = "http://localhost:5001"; // Adjust to your backend URL
      const response = await fetch(`${baseUrl}/api/guides`);
      const data = await response.json();

      if (data.success) {
        setGuides(data.data);
      } else {
        console.warn("Failed to fetch guides:", data.error);
        Alert.alert("Error", "Failed to load guides. Please try again.");
      }
    } catch (error) {
      console.error("Guide fetch error:", error);
      Alert.alert(
        "Error",
        "Failed to connect to server. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const onRefresh = () => {
    fetchGuides(true);
  };

  const filteredGuides = useMemo(() => {
    const term = searchQuery.toLowerCase();
    return guides.filter((guide) => {
      const matchesCategory =
        activeCategory === "All" ||
        guide.category.toLowerCase() === activeCategory.toLowerCase() ||
        guide.specialty?.toLowerCase().includes(activeCategory.toLowerCase());

      const matchesSearch =
        term === "" ||
        guide.name.toLowerCase().includes(term) ||
        guide.city.toLowerCase().includes(term) ||
        guide.specialty.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, guides]);

  const handleChatWithGuide = (guide: Guide) => {
    router.push({
      pathname: "/chat-room",
      params: {
        guideId: guide.id,
        guideName: guide.name,
      },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Local Guides" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading guides...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Local Guides" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.hero}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.heroKicker}>Verified locals</Text>
            <Text style={styles.heroTitle}>Find the perfect guide</Text>
            <Text style={styles.heroSubtitle}>
              Compare ratings, languages, and specialties before you book.
            </Text>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => router.push({ pathname: "/hired-confirm" })}
            >
              <Text style={styles.heroCtaText}>Hire a guide</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop",
            }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, guide, or specialty"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {guideCategories.map((category) => {
              const active = category === activeCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveCategory(category)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filteredGuides.length > 0
              ? `${filteredGuides.length} Guides Available`
              : "Top rated"}
          </Text>
          {filteredGuides.length > 10 && (
            <TouchableOpacity onPress={() => router.push("/guides")}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredGuides.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No guides found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or category filter
            </Text>
          </View>
        ) : (
          <View style={styles.guideList}>
            {filteredGuides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                style={styles.guideCard}
                onPress={() => router.push(`/guide/${guide.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: guide.photo }}
                  style={styles.guidePhoto}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.guideName}>{guide.name}</Text>
                    <View
                      style={[
                        styles.badge,
                        guide.isVerified
                          ? styles.badgeVerified
                          : guide.badge === "New Guide"
                          ? styles.badgeNew
                          : styles.badgeDefault,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          guide.isVerified
                            ? styles.badgeTextVerified
                            : guide.badge === "New Guide"
                            ? styles.badgeTextNew
                            : styles.badgeTextDefault,
                        ]}
                      >
                        {guide.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.guideCity}>{guide.city}</Text>
                  <Text style={styles.guideMeta}>{guide.specialty}</Text>
                  <Text style={styles.guideMeta}>{guide.languages}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.ratingRow}>
                      <MaterialIcons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {guide.rating} ({guide.reviews})
                      </Text>
                      <MaterialIcons
                        name={
                          guide.isAvailable
                            ? "radio-button-checked"
                            : "radio-button-unchecked"
                        }
                        size={12}
                        color={guide.isAvailable ? "#10B981" : "#6B7280"}
                        style={{ marginLeft: 8 }}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: guide.isAvailable ? "#10B981" : "#6B7280" },
                        ]}
                      >
                        {guide.isAvailable ? "Available" : "Busy"}
                      </Text>
                    </View>
                    <Text style={styles.price}>{guide.price}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.chatButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleChatWithGuide(guide);
                      }}
                    >
                      <MaterialIcons name="chat" size={16} color="#FFFFFF" />
                      <Text style={styles.chatButtonText}>Chat Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                          pathname: "/booking",
                          params: { guideId: guide.id },
                        });
                      }}
                    >
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <MaterialIcons
              name="travel-explore"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.featureTitle}>Curated plans</Text>
            <Text style={styles.featureSubtitle}>
              Ready itineraries you can tweak.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <MaterialIcons
              name="verified-user"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.featureTitle}>Verified profiles</Text>
            <Text style={styles.featureSubtitle}>
              Ratings, reviews, and ID checks.
            </Text>
          </View>
          <View style={styles.featureCard}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.featureTitle}>Chat before booking</Text>
            <Text style={styles.featureSubtitle}>
              Align expectations instantly.
            </Text>
          </View>
        </View>

        <View style={styles.ctaCard}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.ctaTitle}>Become a guide</Text>
            <Text style={styles.ctaSubtitle}>
              Host travelers, set your own rates, and get paid.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.ctaButtonText}>Start now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingBottom: 120,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  heroKicker: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  heroCta: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
  },
  heroCtaText: {
    color: "#FFF",
    fontWeight: "700",
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: Radii.lg,
  },
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  chipRow: { gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  sectionLink: {
    color: Colors.primary,
    fontWeight: "700",
  },
  guideList: {
    gap: Spacing.md,
  },
  guideCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guidePhoto: {
    width: 84,
    height: 84,
    borderRadius: Radii.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guideName: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    fontSize: 12,
    fontWeight: "700",
  },
  badgeDefault: {
    backgroundColor: "#E0F2FE",
  },
  badgeVerified: {
    backgroundColor: "#D1FAE5",
  },
  badgeNew: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeTextDefault: {
    color: "#0EA5E9",
  },
  badgeTextVerified: {
    color: "#10B981",
  },
  badgeTextNew: {
    color: "#F59E0B",
  },
  guideCity: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guideMeta: {
    color: Colors.textPrimary,
    marginTop: 2,
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  price: {
    fontWeight: "800",
    color: Colors.primary,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  featureCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  featureTitle: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  featureSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  ctaCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  ctaSubtitle: {
    color: "#E0F2FE",
    fontSize: 13,
  },
  ctaButton: {
    backgroundColor: "#0F172A",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  ctaButtonText: {
    color: "#FFF",
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    gap: 6,
    flex: 1,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    flex: 1,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

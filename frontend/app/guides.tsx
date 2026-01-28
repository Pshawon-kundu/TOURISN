import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { APIClient } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const apiClient = new APIClient();

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
  isOnline: boolean;
  perHourRate: number;
  expertiseCategories: string[];
  coverageAreas: string[];
  phone: string;
  email: string;
}

const guideCategories = [
  "All",
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Rangpur",
  "Barisal",
  "Mymensingh",
  "Beach",
  "Hills",
  "City",
  "Culture",
  "Food",
] as const;

export default function GuidesScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof guideCategories)[number]>("All");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImageOpacity = useRef(new Animated.Value(1)).current;
  const heroImages = [
    "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
    "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
    "https://cdn-icons-png.flaticon.com/512/4140/4140047.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(heroImageOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heroImageOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        Animated.timing(heroImageOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        // Fetch all approved guides
        const result: any = await apiClient.get("/guides");
        if (result && result.success && Array.isArray(result.data)) {
          setGuides(result.data);
        } else if (result && Array.isArray(result.data)) {
          setGuides(result.data); // Fallback if success not present but data is
        }
      } catch (err) {
        console.error("Failed to fetch guides", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle breathing/pulse animation for the hero section
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const filteredGuides = useMemo(() => {
    const term = search.toLowerCase();

    // Check if a string contains any of the target words
    const containsAny = (source: string, targets: string[]) => {
      const sourceLower = source.toLowerCase();
      return targets.some((target) =>
        sourceLower.includes(target.toLowerCase()),
      );
    };

    return guides
      .filter((guide) => {
        const guideName = (guide.name || "").toLowerCase();
        const guideCity = (guide.city || "").toLowerCase();
        const guideSpecialty = (guide.specialty || "").toLowerCase();

        const areas = (guide.coverageAreas || []).map((a) => a.toLowerCase());
        const categories = (guide.expertiseCategories || []).map((c) =>
          c.toLowerCase(),
        );

        // Determine if the guide matches the selected category (Chip)
        let matchesCategory = false;
        if (activeCategory === "All") {
          matchesCategory = true;
        } else {
          const activeLower = activeCategory.toLowerCase();
          matchesCategory =
            categories.includes(activeLower) ||
            areas.includes(activeLower) ||
            guideCity.includes(activeLower) ||
            guide.category.toLowerCase().includes(activeLower);
        }

        // Determine if the guide matches the Search Text
        const matchesSearch =
          guideName.includes(term) ||
          guideCity.includes(term) ||
          guideSpecialty.includes(term) ||
          areas.some((area) => area.includes(term)) ||
          categories.some((cat) => cat.includes(term));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Prioritize "Real" User Guides (non-test-data)
        const isTestGuideA = (a.email || "").includes("tourisn.com");
        const isTestGuideB = (b.email || "").includes("tourisn.com");

        if (!isTestGuideA && isTestGuideB) return -1; // A comes first
        if (isTestGuideA && !isTestGuideB) return 1; // B comes first
        // Sort by active category match strength, then rating
        if (activeCategory !== "All") {
          const aCityMatch = a.city.includes(activeCategory);
          const bCityMatch = b.city.includes(activeCategory);
          if (aCityMatch && !bCityMatch) return -1;
          if (!aCityMatch && bCityMatch) return 1;
        }
        return b.rating - a.rating; // High rating first
      });
  }, [search, activeCategory, guides]);

  const renderGuideCard = (guide: Guide) => {
    return (
      <TouchableOpacity
        key={guide.id}
        activeOpacity={0.9}
        onPress={() => router.push(`/guide/${guide.id}`)}
        style={styles.guideCard}
      >
        <Image
          source={{
            uri:
              guide.photo ||
              `https://ui-avatars.com/api/?name=${guide.name}&background=3B82F6&color=fff`,
          }}
          style={styles.guidePhoto}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.guideName}>{guide.name}</Text>
            {guide.isVerified && <Text style={styles.badge}>Verified</Text>}
          </View>

          <Text style={styles.guideCity}>
            <MaterialIcons name="location-on" size={14} color="#64748B" />
            {" " + (guide.city || "Bangladesh")}
            {guide.coverageAreas && guide.coverageAreas.length > 0
              ? ` • ${guide.coverageAreas[0]}`
              : ""}
          </Text>

          <Text style={styles.guideMeta}>
            {guide.languages || "English, Bengali"}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {guide.rating || 5.0} ({guide.reviews || 0})
              </Text>
            </View>
            <Text style={styles.price}>
              {guide.price || `৳${guide.perHourRate}/hr`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Local Guides" />
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View
            style={[styles.hero, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.heroKicker}>AUTHENTIC EXPERIENCES</Text>
              <Text style={styles.heroTitle}>
                Unlock the Soul of Bangladesh
              </Text>
              <Text style={styles.heroSubtitle}>
                Connect with passionate local experts who turn trips into
                unforgettable memories.
              </Text>
              <TouchableOpacity
                style={styles.heroCta}
                onPress={() => router.push({ pathname: "/hired-confirm" })}
              >
                <Text style={styles.heroCtaText}>Hire a Guide</Text>
              </TouchableOpacity>
            </View>
            <Animated.Image
              source={{
                uri: heroImages[currentImageIndex],
              }}
              style={[
                styles.heroImage,
                { resizeMode: "contain", opacity: heroImageOpacity },
              ]}
            />
          </Animated.View>

          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={18} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search city, guide, or specialty"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
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
            <Text style={styles.sectionTitle}>Top rated</Text>
            <TouchableOpacity onPress={() => router.push("/guides")}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.guideList}>
              {filteredGuides.length === 0 ? (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    marginTop: 20,
                  }}
                >
                  No guides found matching your criteria.
                </Text>
              ) : (
                filteredGuides.map(renderGuideCard)
              )}
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
              onPress={() => {
                if (user) {
                  router.push("/guide-registration");
                } else {
                  router.push("/signup");
                }
              }}
            >
              <Text style={styles.ctaButtonText}>
                {user ? "Register as Guide" : "Start now"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>
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
    backgroundColor: "#E0F2FE",
    color: "#0EA5E9",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    fontSize: 12,
    fontWeight: "700",
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
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  quickChatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  quickChatText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  bookButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
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
});

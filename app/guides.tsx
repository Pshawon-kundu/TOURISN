import { BottomPillNav } from "@/components/bottom-pill-nav";
import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
] as const;

const guides = [
  {
    id: "g1",
    name: "Arif Rahman",
    city: "Dhaka & Old Town",
    rating: 4.9,
    reviews: 210,
    price: "৳1,200/day",
    specialty: "Heritage walks, food trails",
    languages: "Bangla, English",
    badge: "Top pick",
    category: "City" as const,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
  },
  {
    id: "g2",
    name: "Mina Akter",
    city: "Sylhet tea gardens",
    rating: 4.8,
    reviews: 180,
    price: "৳1,100/day",
    specialty: "Tea estates, waterfalls",
    languages: "Bangla, English",
    badge: "Nature",
    category: "Hills" as const,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
  },
  {
    id: "g3",
    name: "Rana Chowdhury",
    city: "Cox's Bazar coastline",
    rating: 4.7,
    reviews: 260,
    price: "৳1,500/day",
    specialty: "Surf, seafood, sunsets",
    languages: "Bangla, English",
    badge: "Beach",
    category: "Beach" as const,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop",
  },
  {
    id: "g4",
    name: "Farzana Yasmin",
    city: "Bandarban hills",
    rating: 4.9,
    reviews: 190,
    price: "৳1,800/day",
    specialty: "Hill treks, tribal culture",
    languages: "Bangla, English, Hindi",
    badge: "Adventure",
    category: "Hills" as const,
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop",
  },
  {
    id: "g5",
    name: "Nadia Karim",
    city: "Sajek & Rangamati",
    rating: 4.6,
    reviews: 150,
    price: "৳1,600/day",
    specialty: "Sunrise points, lake cruises",
    languages: "Bangla, English",
    badge: "Scenic",
    category: "Hills" as const,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
  },
];

export default function GuidesScreen() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof guideCategories)[number]>("All");

  const filteredGuides = useMemo(() => {
    const term = search.toLowerCase();
    return guides.filter((guide) => {
      const matchesCategory =
        activeCategory === "All" || guide.category === activeCategory;
      const matchesSearch =
        guide.name.toLowerCase().includes(term) ||
        guide.city.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <ThemedView style={styles.container}>
      <Header title="Local Guides" />
      <ScrollView contentContainerStyle={styles.content}>
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
              uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop",
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

        <View style={styles.guideList}>
          {filteredGuides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => router.push(`/guide/${guide.id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: guide.photo }} style={styles.guidePhoto} />
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.guideName}>{guide.name}</Text>
                  <Text style={styles.badge}>{guide.badge}</Text>
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
                  </View>
                  <Text style={styles.price}>{guide.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
      <BottomPillNav />
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

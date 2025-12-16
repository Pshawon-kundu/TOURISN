import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FoodItem {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  region: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  isVeg: boolean;
  spiceLevel: number;
}

const foodCategories = [
  "All",
  "Main Course",
  "Street Food",
  "Sweets",
  "Seafood",
  "Beverages",
] as const;

const foodItems: FoodItem[] = [
  {
    id: "f1",
    name: "Kacchi Biryani",
    nameLocal: "কাচ্চি বিরিয়ানি",
    category: "Main Course",
    region: "Dhaka",
    description:
      "Aromatic rice cooked with marinated mutton, saffron, and spices",
    price: "৳350-550",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    isVeg: false,
    spiceLevel: 3,
  },
  {
    id: "f2",
    name: "Hilsha Fish Curry",
    nameLocal: "ইলিশ মাছের ঝোল",
    category: "Main Course",
    region: "Dhaka",
    description:
      "National fish of Bangladesh cooked in mustard gravy with rice",
    price: "৳450-650",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800",
    isVeg: false,
    spiceLevel: 2,
  },
  {
    id: "f3",
    name: "Fuchka & Chotpoti",
    nameLocal: "ফুচকা ও চটপটি",
    category: "Street Food",
    region: "Dhaka",
    description:
      "Crispy puffed shells filled with tamarind water and spicy chickpeas",
    price: "৳30-50",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
    isVeg: true,
    spiceLevel: 3,
  },
  {
    id: "f4",
    name: "Panta Ilish",
    nameLocal: "পান্তা ইলিশ",
    category: "Main Course",
    region: "Nationwide",
    description:
      "Traditional fermented rice with fried hilsha, onion, and chili",
    price: "৳250-400",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800",
    isVeg: false,
    spiceLevel: 3,
  },
  {
    id: "f5",
    name: "Beef Tehari",
    nameLocal: "গরুর তেহারি",
    category: "Main Course",
    region: "Old Dhaka",
    description: "Spicy beef rice cooked with aromatic spices and potatoes",
    price: "৳180-280",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800",
    isVeg: false,
    spiceLevel: 4,
  },
  {
    id: "f6",
    name: "Chitol Macher Muitha",
    nameLocal: "চিতল মাছের মুইঠা",
    category: "Main Course",
    region: "Sylhet",
    description: "Fish dumplings cooked in rich, creamy gravy",
    price: "৳320-450",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1605908502724-9093a79a1b39?w=800",
    isVeg: false,
    spiceLevel: 2,
  },
  {
    id: "f7",
    name: "Shatkora Beef",
    nameLocal: "সাতকরা গরুর মাংস",
    category: "Main Course",
    region: "Sylhet",
    description: "Beef curry with Sylheti citrus fruit (shatkora)",
    price: "৳380-520",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
    isVeg: false,
    spiceLevel: 3,
  },
  {
    id: "f8",
    name: "Seven Layer Tea",
    nameLocal: "সাত রঙের চা",
    category: "Beverages",
    region: "Sylhet",
    description: "Famous multi-layered tea with distinct color bands",
    price: "৳50-80",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
  {
    id: "f9",
    name: "Chingri Malai Curry",
    nameLocal: "চিংড়ি মালাই কারি",
    category: "Seafood",
    region: "Khulna",
    description: "Tiger prawns in creamy coconut milk curry",
    price: "৳550-750",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1633964913295-ceb43826923c?w=800",
    isVeg: false,
    spiceLevel: 2,
  },
  {
    id: "f10",
    name: "Shutki Bhorta",
    nameLocal: "শুটকি ভর্তা",
    category: "Main Course",
    region: "Cox's Bazar",
    description: "Mashed dried fish with mustard oil and green chilies",
    price: "৳120-200",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800",
    isVeg: false,
    spiceLevel: 4,
  },
  {
    id: "f11",
    name: "Grilled Lobster",
    nameLocal: "গ্রিল করা লবস্টার",
    category: "Seafood",
    region: "Cox's Bazar",
    description: "Fresh lobster grilled with butter and garlic",
    price: "৳1200-1800",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=800",
    isVeg: false,
    spiceLevel: 1,
  },
  {
    id: "f12",
    name: "Mezban Beef",
    nameLocal: "মেজবানী গরুর মাংস",
    category: "Main Course",
    region: "Chittagong",
    description: "Spicy beef curry in thick gravy, traditional feast dish",
    price: "৳280-420",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
    isVeg: false,
    spiceLevel: 4,
  },
  {
    id: "f13",
    name: "Bamboo Chicken",
    nameLocal: "বাঁশের ভেতর মুরগি",
    category: "Main Course",
    region: "Bandarban",
    description: "Chicken cooked inside bamboo with tribal spices",
    price: "৳350-500",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800",
    isVeg: false,
    spiceLevel: 2,
  },
  {
    id: "f14",
    name: "Bhuna Khichuri",
    nameLocal: "ভুনা খিচুড়ি",
    category: "Main Course",
    region: "Nationwide",
    description: "Spiced rice and lentil dish, comfort food during monsoon",
    price: "৳150-250",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1589301760014-dd4c7e38d16e?w=800",
    isVeg: true,
    spiceLevel: 2,
  },
  {
    id: "f15",
    name: "Mishti Doi",
    nameLocal: "মিষ্টি দই",
    category: "Sweets",
    region: "Bogra",
    description: "Sweet yogurt dessert made from caramelized milk",
    price: "৳80-150",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1576398289164-c48dc021b4e1?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
  {
    id: "f16",
    name: "Roshogolla",
    nameLocal: "রসগোল্লা",
    category: "Sweets",
    region: "Comilla",
    description: "Soft, spongy cheese balls soaked in sugar syrup",
    price: "৳60-120",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606313564016-5b17cd1e8b5d?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
  {
    id: "f17",
    name: "Chomchom",
    nameLocal: "চমচম",
    category: "Sweets",
    region: "Poradaha",
    description: "Cylinder-shaped milk sweet with creamy filling",
    price: "৳100-180",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
  {
    id: "f18",
    name: "Pitha (Rice Cakes)",
    nameLocal: "পিঠা",
    category: "Sweets",
    region: "Nationwide",
    description: "Traditional rice cakes in various styles - bhapa, chitoi, puli",
    price: "৳50-150",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
  {
    id: "f19",
    name: "Borhani",
    nameLocal: "বোরহানি",
    category: "Beverages",
    region: "Dhaka",
    description: "Spiced yogurt drink served with biryani",
    price: "৳40-80",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1568031813264-d394c5d474b9?w=800",
    isVeg: true,
    spiceLevel: 1,
  },
  {
    id: "f20",
    name: "Cha & Biscuit",
    nameLocal: "চা ও বিস্কুট",
    category: "Beverages",
    region: "Nationwide",
    description: "Traditional milk tea with local biscuits",
    price: "৳20-40",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
    isVeg: true,
    spiceLevel: 0,
  },
];

export default function FoodGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    (typeof foodCategories)[number]
  >("All");

  const filteredFoods = foodItems.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.nameLocal.includes(searchQuery) ||
      food.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSpiceLevel = (level: number) => {
    return (
      <View style={styles.spiceContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name="flame"
            size={12}
            color={i < level ? "#EF4444" : "#E5E7EB"}
          />
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Food Guide" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#F59E0B", "#F97316"]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="restaurant" size={48} color="white" />
          <Text style={styles.heroTitle}>Bangladeshi Cuisine</Text>
          <Text style={styles.heroSubtitle}>
            Discover authentic flavors from across Bangladesh
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{foodItems.length}+</Text>
              <Text style={styles.statLabel}>Dishes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8+</Text>
              <Text style={styles.statLabel}>Regions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Restaurants</Text>
            </View>
          </View>
        </LinearGradient>

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
            placeholder="Search dishes or regions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {foodCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                activeCategory === category && styles.categoryPillActive,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Food Items Grid */}
        <View style={styles.foodGrid}>
          {filteredFoods.map((food) => (
            <View key={food.id} style={styles.foodCard}>
              <Image source={{ uri: food.image }} style={styles.foodImage} />
              
              {/* Badges */}
              <View style={styles.badgeContainer}>
                {food.isVeg && (
                  <View style={[styles.badge, styles.badgeVeg]}>
                    <MaterialCommunityIcons name="leaf" size={12} color="#10B981" />
                  </View>
                )}
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#FCD34D" />
                  <Text style={styles.ratingText}>{food.rating}</Text>
                </View>
              </View>

              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodNameLocal}>{food.nameLocal}</Text>
                
                <View style={styles.foodMeta}>
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text style={styles.foodRegion}>{food.region}</Text>
                </View>

                <Text style={styles.foodDescription} numberOfLines={2}>
                  {food.description}
                </Text>

                <View style={styles.foodFooter}>
                  <View>
                    <Text style={styles.foodPrice}>{food.price}</Text>
                    <Text style={styles.priceLabel}>per serving</Text>
                  </View>
                  {food.spiceLevel > 0 && renderSpiceLevel(food.spiceLevel)}
                </View>

                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonText}>Find Restaurants</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* No Results */}
        {filteredFoods.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <Text style={styles.noResultsText}>No dishes found</Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search or category
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: 32,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: "#F59E0B",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryTextActive: {
    color: "white",
  },
  foodGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  foodCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  foodImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "white",
  },
  badgeVeg: {
    borderWidth: 1,
    borderColor: "#10B981",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  foodInfo: {
    padding: 16,
  },
  foodName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  foodNameLocal: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  foodMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  foodRegion: {
    fontSize: 14,
    color: "#6B7280",
  },
  foodDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
    lineHeight: 20,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  priceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  spiceContainer: {
    flexDirection: "row",
    gap: 2,
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

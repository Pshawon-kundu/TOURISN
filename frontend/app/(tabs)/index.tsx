import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { signOut as signOutUser } from "@/lib/auth";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Traveler";
  const userEmail = user?.email || "";
  const userInitial = displayName.charAt(0).toUpperCase();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace("/welcome");
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      setSigningOut(false);
    }
  };

  const services = [
    {
      iconFamily: "Ionicons",
      icon: "car-sport",
      title: "Transport",
      route: "/transport",
      color: "#3B82F6",
    },
    {
      iconFamily: "Ionicons",
      icon: "bed",
      title: "Stays",
      route: "/booking",
      color: "#8B5CF6",
    },
    {
      iconFamily: "FontAwesome5",
      icon: "compass",
      title: "Guides",
      route: "/guides",
      color: "#10B981",
    },
    {
      iconFamily: "Ionicons",
      icon: "restaurant",
      title: "Food",
      route: "/food",
      color: "#F59E0B",
    },
    {
      iconFamily: "MaterialCommunityIcons",
      icon: "map-marker-path",
      title: "Experiences",
      route: "/explore",
      color: "#EF4444",
    },
    {
      iconFamily: "Ionicons",
      icon: "chatbubbles",
      title: "Chat",
      route: "/chat",
      color: "#06B6D4",
    },
  ] as const;

  const featuredTrips = [
    {
      title: "Cox's Bazar Beach Escape",
      tag: "Sun & Sea",
      price: "From ৳ 1,200",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    },
    {
      title: "Bandarban Hill Trails",
      tag: "Adventure",
      price: "From ৳ 1,800",
      image:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    },
    {
      title: "Sylhet Tea Garden Escape",
      tag: "Nature",
      price: "From ৳ 1,100",
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800",
    },
  ];

  const topGuides = [
    {
      name: "Rakibul Islam",
      city: "Chittagong",
      rating: "4.8",
      reviews: 390,
      photo:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    },
    {
      name: "Riaz Afridi",
      city: "Cox's Bazar",
      rating: "4.7",
      reviews: 240,
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.profileBadge}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View>
            <Text style={styles.headerGreeting}>Hi, {displayName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButtonHeader}>
          <Ionicons name="notifications" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <Animated.View
          style={[
            styles.heroCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Plan your next escape</Text>
            <Text style={styles.heroSubtitle}>
              Stays, guides, rides, and food in one place.
            </Text>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => router.push("/explore")}
            >
              <Text style={styles.heroCtaText}>Explore now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
            }}
            style={styles.heroImage}
          />
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, guides, hotels..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsScroll}
          >
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/explore")}
            >
              <View
                style={[styles.quickIconCircle, { backgroundColor: "#EFF6FF" }]}
              >
                <Ionicons name="airplane" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickLabel}>Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/booking")}
            >
              <View
                style={[styles.quickIconCircle, { backgroundColor: "#F0FDF4" }]}
              >
                <Ionicons name="calendar" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickLabel}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/explore")}
            >
              <View
                style={[styles.quickIconCircle, { backgroundColor: "#FEF3C7" }]}
              >
                <Ionicons name="pricetag" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickLabel}>Deals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/chat")}
            >
              <View
                style={[styles.quickIconCircle, { backgroundColor: "#FCE7F3" }]}
              >
                <Ionicons name="chatbubbles" size={24} color="#EC4899" />
              </View>
              <Text style={styles.quickLabel}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push("/guide-registration")}
            >
              <View
                style={[styles.quickIconCircle, { backgroundColor: "#DBEAFE" }]}
              >
                <Ionicons name="person-add" size={24} color="#0284C7" />
              </View>
              <Text style={styles.quickLabel}>Become Guide</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Services grid */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.title}
                style={[
                  serviceCardStyles.card,
                  { borderLeftWidth: 4, borderLeftColor: service.color },
                ]}
                onPress={() => router.push(service.route)}
              >
                <View
                  style={[
                    serviceCardStyles.iconWrapper,
                    { backgroundColor: service.color + "15" },
                  ]}
                >
                  {service.iconFamily === "Ionicons" && (
                    <Ionicons
                      name={service.icon as any}
                      size={28}
                      color={service.color}
                    />
                  )}
                  {service.iconFamily === "MaterialCommunityIcons" && (
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={28}
                      color={service.color}
                    />
                  )}
                  {service.iconFamily === "FontAwesome5" && (
                    <FontAwesome5
                      name={service.icon as any}
                      size={24}
                      color={service.color}
                    />
                  )}
                </View>
                <Text style={serviceCardStyles.title}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Trips */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Featured trips</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {featuredTrips.map((trip) => (
              <View key={trip.title} style={styles.featureCard}>
                <Image
                  source={{ uri: trip.image }}
                  style={styles.featureImage}
                />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTag}>{trip.tag}</Text>
                  <Text style={styles.featureTitle}>{trip.title}</Text>
                  <Text style={styles.featurePrice}>{trip.price}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Top Guides */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Top guides</Text>
          {topGuides.map((guide) => (
            <View key={guide.name} style={styles.guideCard}>
              <Image source={{ uri: guide.photo }} style={styles.guideAvatar} />
              <View style={styles.guideInfo}>
                <Text style={styles.guideName}>{guide.name}</Text>
                <Text style={styles.guideMeta}>{guide.city}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.guideRating}>
                    {guide.rating} ({guide.reviews} reviews)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.guideAction}
                onPress={() => router.push("/guides")}
              >
                <Text style={styles.guideActionText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Promo CTA */}
        <View style={styles.promoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>Earn while you travel</Text>
            <Text style={styles.promoSubtitle}>
              Become a local guide and host travelers.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.promoButton}
            onPress={() => router.push("/guides")}
          >
            <Text style={styles.promoButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sidebar Drawer Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={styles.drawerContainer}>
            <ScrollView>
              {/* Profile Section */}
              <View style={styles.drawerProfile}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarText}>{userInitial}</Text>
                  <View style={styles.onlineIndicator} />
                </View>
                <Text style={styles.drawerName}>Hello, {displayName}</Text>
                {!!userEmail && (
                  <Text style={styles.drawerSubtitle}>{userEmail}</Text>
                )}
              </View>

              {/* Main Menu */}
              <View style={styles.menuSection}>
                <DrawerItem
                  icon="🏠"
                  title="Home"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/");
                  }}
                />
                <DrawerItem
                  icon="🎒"
                  title="Experience"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/explore");
                  }}
                />
                <DrawerItem
                  icon="💼"
                  title="Business"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/booking");
                  }}
                />
                <DrawerItem
                  icon="👥"
                  title="About us"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/about");
                  }}
                />
              </View>

              <View style={styles.divider} />

              {/* Services Section */}
              <View style={styles.menuSection}>
                <DrawerItem
                  icon="🚗"
                  title="Transport"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/transport");
                  }}
                />
                <DrawerItem
                  icon="🏨"
                  title="Hotel"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/booking");
                  }}
                />
                <DrawerItem
                  icon="🍽️"
                  title="Food"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/food");
                  }}
                />
                <DrawerItem
                  icon="🗺️"
                  title="Guide"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/guides");
                  }}
                />
              </View>

              <View style={styles.divider} />

              {/* Account Section */}
              <View style={styles.menuSection}>
                <DrawerItem
                  icon="👤"
                  title="Profile"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/profile");
                  }}
                />
                <DrawerItem
                  icon="🔔"
                  title="Notifications"
                  onPress={() => {
                    setMenuVisible(false);
                  }}
                />
                <DrawerItem
                  icon="💬"
                  title="Messages"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/chat");
                  }}
                />
                <DrawerItem
                  icon="🚪"
                  title={signingOut ? "Signing out..." : "Log Out"}
                  onPress={() => {
                    setMenuVisible(false);
                    handleLogout();
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomPillNav />
    </ThemedView>
  );
}

function DrawerItem({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={drawerItemStyles.container} onPress={onPress}>
      <Text style={drawerItemStyles.icon}>{icon}</Text>
      <Text style={drawerItemStyles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const serviceCardStyles = StyleSheet.create({
  card: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: 6,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: Colors.textPrimary,
  },
});

const drawerItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.lg,
    width: 30,
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  menuButton: {
    padding: Spacing.sm,
  },
  menuIconHeader: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "600",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
    marginLeft: Spacing.md,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  notificationButtonHeader: {
    padding: Spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  content: { paddingBottom: 120 },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: "#007AFF",
    borderRadius: Radii.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTextBlock: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  heroCta: {
    marginTop: 8,
    backgroundColor: "#FFF",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
  },
  heroCtaText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: Radii.md,
    marginLeft: Spacing.md,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  quickAction: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardsScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  featureCard: {
    width: 240,
    borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  featureImage: {
    width: "100%",
    height: 130,
  },
  featureContent: {
    padding: Spacing.md,
    gap: 4,
  },
  featureTag: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "700",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  featurePrice: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  guideAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: Spacing.md,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  guideMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guideRating: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 4,
    fontWeight: "600",
  },
  guideAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  guideActionText: {
    color: "#FFF",
    fontWeight: "700",
  },
  promoCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  promoTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  promoSubtitle: {
    color: "#E9F7EF",
    fontSize: 13,
    fontWeight: "500",
  },
  promoButton: {
    backgroundColor: "#0F172A",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
  },
  promoButtonText: {
    color: "#FFF",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  horizontalScroll: {
    paddingBottom: Spacing.sm,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerContainer: {
    width: "75%",
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerProfile: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  drawerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    position: "relative",
  },
  drawerAvatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuSection: {
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.sm,
  },
});

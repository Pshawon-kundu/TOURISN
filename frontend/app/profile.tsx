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

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { APIClient } from "@/lib/api";
import { signOut as signOutUser } from "@/lib/auth";

const apiClient = new APIClient();

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiClient.getCurrentUser();
      if (profile) {
        setUserProfile(profile as UserProfile);
        // Load booking count
        try {
          const bookings = await apiClient.request({
            method: "GET",
            endpoint: "/bookings",
          });
          setBookingCount(Array.isArray(bookings) ? bookings.length : 0);
        } catch {
          console.log("Could not load bookings count");
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      Alert.alert("Error", "Failed to load your profile");
    } finally {
      setLoading(false);
    }
  };

  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
    : user?.displayName || "User";
  const userEmail = userProfile?.email || user?.email || "user@example.com";

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.replace("/welcome");
    } catch (err) {
      console.warn("Logout failed", err);
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Avatar Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    userProfile?.avatar_url ||
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
                }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            {userProfile?.bio && (
              <Text style={styles.userBio}>{userProfile.bio}</Text>
            )}
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Bookings</Text>
              <Text style={styles.statValue}>{bookingCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Saved</Text>
              <Text style={styles.statValue}>{favoriteCount}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Reviews</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.menuText}>Profile</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.menuText}>Bookmarked</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="earth-outline"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.menuText}>Previous Trips</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.menuText}>Settings</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </View>
                <Text style={styles.menuText}>Version</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={handleLogout}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="log-out-outline" size={20} color="#D22" />
                </View>
                <Text style={[styles.menuText, { color: "#D22" }]}>
                  Log Out
                </Text>
              </View>
              <Text style={[styles.chevron, { color: "#D22" }]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
      <BottomPillNav />
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
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  editButton: {
    padding: Spacing.sm,
  },
  editIcon: {
    fontSize: 20,
  },
  content: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4E4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E90FF",
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E90FF",
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  chevron: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: "300",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userBio: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
});

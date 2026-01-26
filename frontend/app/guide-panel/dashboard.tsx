import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/auth";
import ToggleOnlineStatus from "./toggle-online";

export default function GuideDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingBookings: 0,
    activeChats: 0,
    totalEarnings: 0,
    rating: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchGuideData = React.useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      // 1. Get Guide ID from user ID
      const { data: guideData, error: guideError } = await supabase
        .from("guides")
        .select("id, rating, hourly_rate")
        .eq("user_id", user.id)
        .single();

      if (guideError || !guideData) {
        // Maybe guide not approved yet or doesn't exist
        console.log("Guide profile not found or error:", guideError);
        setRefreshing(false);
        return;
      }

      // 2. Fetch Bookings
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*, users!bookings_user_id_fkey(first_name, last_name)")
        .eq("item_id", guideData.id) // Assuming booking item_id refers to guide_id for guide bookings
        .order("created_at", { ascending: false });

      if (bookingError) {
        console.error("Error fetching bookings:", bookingError);
      }

      // 3. Fetch Active Chat Rooms Count
      const { data: chatRoomsData, error: chatError } = await supabase
        .from("chat_rooms")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (chatError) {
        console.error("Error fetching chat rooms:", chatError);
      }

      const activeChatsCount = chatRoomsData?.length || 0;

      if (bookingData) {
        setBookings(bookingData);
        setStats({
          pendingBookings: bookingData.filter((b) => b.status === "pending")
            .length,
          activeChats: activeChatsCount,
          totalEarnings: bookingData
            .filter((b) => b.payment_status === "paid")
            .reduce((sum, b) => sum + (b.total_price || 0), 0),
          rating: guideData.rating || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching guide dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGuideData();
  }, [fetchGuideData]);

  const StatCard = ({
    icon,
    value,
    label,
    color,
  }: {
    icon: any;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchGuideData} />
        }
      >
        {/* Header */}
        <View style={styles.headerCard}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>👋 Welcome back,</Text>
              <Text style={styles.guideName}>
                {user?.displayName || user?.email || "Guide"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/guide-panel/profile")}
            >
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(user?.displayName || user?.email || "G")
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Online Status Toggle - Integrated into header */}
          <ToggleOnlineStatus />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>📊 Dashboard Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="calendar-outline"
              value={stats.pendingBookings}
              label="Pending Req"
              color="#F59E0B"
            />
            <StatCard
              icon="chatbubbles-outline"
              value={stats.activeChats}
              label="Active Chats"
              color="#3B82F6"
            />
            <StatCard
              icon="star"
              value={stats.rating.toFixed(1)}
              label="Rating"
              color="#10B981"
            />
            <StatCard
              icon="wallet-outline"
              value={`৳${stats.totalEarnings}`}
              label="Earnings"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Recent Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        ) : (
          bookings.slice(0, 3).map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingUser}>
                  {booking.users?.first_name || "Traveler"}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        booking.status === "confirmed" ? "#DCFCE7" : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          booking.status === "confirmed"
                            ? "#166534"
                            : "#B45309",
                      },
                    ]}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.bookingDetails}>
                📅 {new Date(booking.check_in_date).toDateString()}
              </Text>
              <Text style={styles.bookingDetails}>
                📍 {booking.location || "Dhaka, Bangladesh"}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/guide-panel/chats")}
          >
            <Ionicons name="chatbubble" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            onPress={() => router.push("/guide-panel/profile")}
          >
            <Ionicons name="settings" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: 6,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  guideName: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  profileBtn: {
    padding: 4,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 20,
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: Spacing.md,
    borderRadius: Radii.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: "#F8FAFC",
    borderRadius: Radii.md,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.sm,
    color: "#94A3B8",
  },
  bookingCard: {
    backgroundColor: "#FFF",
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  bookingUser: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  bookingDetails: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radii.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

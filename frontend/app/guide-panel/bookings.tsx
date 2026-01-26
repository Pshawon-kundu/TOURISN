import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/auth";

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_status: string;
  total_price: number;
  guests: number;
  location?: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function GuideBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "completed"
  >("all");

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      // Get guide ID
      const { data: guideData } = await supabase
        .from("guides")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!guideData) {
        return;
      }

      // Fetch bookings
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          users!bookings_user_id_fkey (
            first_name,
            last_name,
            email,
            phone
          )
        `,
        )
        .eq("item_id", guideData.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "#DCFCE7", text: "#166534" };
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309" };
      case "completed":
        return { bg: "#DBEAFE", text: "#1E40AF" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B" };
      default:
        return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusColor = getStatusColor(item.status);
    const travelerName = item.users
      ? `${item.users.first_name} ${item.users.last_name}`
      : "Unknown Traveler";

    return (
      <TouchableOpacity style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.travelerInfo}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {travelerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.travelerName}>{travelerName}</Text>
              <Text style={styles.travelerContact}>
                {item.users?.phone || item.users?.email}
              </Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
          >
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(item.check_in_date).toLocaleDateString()}
              {item.check_out_date &&
                ` - ${new Date(item.check_out_date).toLocaleDateString()}`}
            </Text>
          </View>

          {item.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{item.guests || 1} Guest(s)</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={16} color="#64748B" />
            <Text style={[styles.detailText, styles.priceText]}>
              ৳{item.total_price.toLocaleString()}
            </Text>
          </View>
        </View>

        {item.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptBtn}>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value: typeof filter;
  }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterBtnText,
          filter === value && styles.filterBtnTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {bookings.filter((b) => b.status === "pending").length} Pending
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton label="All" value="all" />
        <FilterButton label="Pending" value="pending" />
        <FilterButton label="Confirmed" value="confirmed" />
        <FilterButton label="Completed" value="completed" />
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Bookings</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "You don't have any bookings yet"
                : `No ${filter} bookings found`}
            </Text>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: Spacing.lg,
    paddingTop: 60,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statsText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  filtersContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterBtnTextActive: {
    color: "#FFF",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSmallText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  travelerContact: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  bookingDetails: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
  },
  priceText: {
    fontWeight: "700",
    color: Colors.primary,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: Radii.md,
  },
  acceptBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF",
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  rejectBtnText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});

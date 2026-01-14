import { useRealTimeStays } from "@/hooks/use-real-time-stays";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RealTimeStaysDashboardProps {
  showHeader?: boolean;
  maxItems?: number;
  onBookingPress?: (bookingId: string) => void;
}

export const RealTimeStaysDashboard: React.FC<RealTimeStaysDashboardProps> = ({
  showHeader = true,
  maxItems = 10,
  onBookingPress,
}) => {
  const { bookings, stats, loading, error, refreshData, isRealTimeConnected } =
    useRealTimeStays(true);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const displayedBookings = bookings.slice(0, maxItems);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Real-Time Stay Bookings</Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: isRealTimeConnected ? "#10B981" : "#EF4444",
                },
              ]}
            />
            <Text style={styles.statusText}>
              {isRealTimeConnected ? "Live" : "Offline"}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.totalCard]}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={[styles.statCard, styles.revenueCard]}>
              <Text style={styles.statNumber}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.statCard, styles.todayCard]}>
              <Text style={styles.statNumber}>{stats.todayBookings}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={[styles.statCard, styles.confirmedCard]}>
              <Text style={styles.statNumber}>{stats.confirmed}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Bookings */}
      <View style={styles.bookingsContainer}>
        <Text style={styles.sectionTitle}>
          Recent Bookings {bookings.length > 0 && `(${bookings.length})`}
        </Text>

        {loading && bookings.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading stay bookings...</Text>
          </View>
        ) : displayedBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No stay bookings yet</Text>
            <Text style={styles.emptySubtext}>
              New bookings will appear here in real-time
            </Text>
          </View>
        ) : (
          displayedBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => onBookingPress?.(booking.id)}
            >
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.bookingProperty}>
                    {booking.property_name}
                  </Text>
                  <Text style={styles.bookingLocation}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6B7280"
                    />
                    {" " + booking.location}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(booking.status)}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) },
                    ]}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.bookingMeta}>
                  <Text style={styles.travelerName}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    {" " + booking.traveler_name}
                  </Text>
                  <Text style={styles.guestCount}>
                    <Ionicons name="people-outline" size={14} color="#6B7280" />
                    {" " + booking.number_of_guests} guests
                  </Text>
                </View>

                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingDate}>
                    {formatDate(booking.created_at)}
                  </Text>
                  <Text style={styles.bookingAmount}>
                    {formatCurrency(booking.total_amount)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {bookings.length > maxItems && (
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              View All {bookings.length} Bookings
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    flex: 1,
    color: "#EF4444",
    fontSize: 14,
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  totalCard: {
    backgroundColor: "#EFF6FF",
  },
  revenueCard: {
    backgroundColor: "#F0FDF4",
  },
  todayCard: {
    backgroundColor: "#FFFBEB",
  },
  confirmedCard: {
    backgroundColor: "#F3E8FF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  bookingsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "semibold",
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingProperty: {
    fontSize: 16,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 4,
  },
  bookingLocation: {
    fontSize: 14,
    color: "#6B7280",
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookingDetails: {
    gap: 8,
  },
  bookingMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  travelerName: {
    fontSize: 14,
    color: "#6B7280",
    flexDirection: "row",
    alignItems: "center",
  },
  guestCount: {
    fontSize: 14,
    color: "#6B7280",
    flexDirection: "row",
    alignItems: "center",
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "medium",
  },
});

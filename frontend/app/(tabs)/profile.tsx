import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  address?: string;
  date_of_birth?: string;
}

interface Booking {
  id: string;
  item_name: string;
  booking_type: string;
  total_price: number;
  booking_status: string;
  created_at: string;
  check_in_date?: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"current" | "previous">(
    "current",
  );

  // Edit form states
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadBookings();
    }, []),
  );

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await apiClient.getCurrentUser();
      if (profile) {
        setUserProfile(profile as UserProfile);
        const userProf = profile as UserProfile;
        setEditFirstName(userProf.first_name || "");
        setEditLastName(userProf.last_name || "");
        setEditPhone(userProf.phone || "");
        setEditAddress((userProf as any).address || "");
        setEditBio(userProf.bio || "");
        setEditAvatar(userProf.avatar_url || "");
      }
    } catch (err: any) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const result = await apiClient.request({
        method: "GET",
        endpoint: "/bookings",
      });
      if (Array.isArray(result)) {
        setBookings(result);
        // Calculate reward points (10 points per 1000 TK spent)
        const totalSpent = result.reduce(
          (sum, b) => sum + (b.total_price || 0),
          0,
        );
        setRewardPoints(Math.floor(totalSpent / 100));
      }
    } catch {
      console.log("Could not load bookings");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editFirstName.trim()) {
        Alert.alert("Required", "Please enter your first name");
        return;
      }

      setSaving(true);

      // Update profile via API
      const result = await apiClient.request({
        method: "PATCH",
        endpoint: "/profile",
        body: {
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          phone: editPhone.trim(),
          bio: editBio.trim(),
          avatar_url: editAvatar,
          address: editAddress.trim(),
        },
      });

      // Update local state with new data
      setUserProfile({
        ...userProfile!,
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        phone: editPhone.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatar,
        address: editAddress.trim(),
      });

      // Close modal first
      setShowEditModal(false);

      // Show success popup
      setTimeout(() => {
        Alert.alert("Done", "Profile updated successfully!", [
          { text: "OK", style: "default" },
        ]);
      }, 300);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOutUser();
            router.replace("/login");
          } catch (err) {
            console.warn("Logout failed", err);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSavedPlaces = () => {
    router.push("/saved-places");
  };

  const handleFavorites = () => {
    router.push("/favorites");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
    : user?.displayName || "User";
  const userEmail = userProfile?.email || user?.email || "user@example.com";

  const currentBookings = bookings.filter(
    (b) => b.booking_status === "confirmed" || b.booking_status === "pending",
  );
  const previousBookings = bookings.filter(
    (b) => b.booking_status === "completed" || b.booking_status === "cancelled",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#3B82F6";
      case "cancelled":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "completed":
        return "checkbox";
      case "cancelled":
        return "close-circle";
      default:
        return "information-circle";
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
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header with Avatar */}
          <View style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri:
                      userProfile?.avatar_url ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={pickImage}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
                <View style={styles.rewardBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>
                    {rewardPoints} Reward Points
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{bookings.length}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-done" size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{previousBookings.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="gift" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{rewardPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="person"
                label="Full Name"
                value={userName || "Not set"}
              />
              <InfoRow icon="mail" label="Email" value={userEmail} />
              <InfoRow
                icon="call"
                label="Phone"
                value={userProfile?.phone || "Not set"}
              />
              <InfoRow
                icon="location"
                label="Address"
                value={(userProfile as any)?.address || "Not set"}
              />
              {userProfile?.bio && (
                <InfoRow
                  icon="information-circle"
                  label="Bio"
                  value={userProfile.bio}
                />
              )}
            </View>
          </View>

          {/* Booking History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking History</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "current" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("current")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "current" && styles.tabTextActive,
                  ]}
                >
                  Current ({currentBookings.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "previous" && styles.tabActive,
                ]}
                onPress={() => setSelectedTab("previous")}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "previous" && styles.tabTextActive,
                  ]}
                >
                  Previous ({previousBookings.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Booking List */}
            {selectedTab === "current" ? (
              currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    statusColor={getStatusColor(booking.booking_status)}
                    statusIcon={getStatusIcon(booking.booking_status)}
                  />
                ))
              ) : (
                <EmptyState
                  icon="calendar-outline"
                  message="No current bookings"
                />
              )
            ) : previousBookings.length > 0 ? (
              previousBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  statusColor={getStatusColor(booking.booking_status)}
                  statusIcon={getStatusIcon(booking.booking_status)}
                />
              ))
            ) : (
              <EmptyState icon="time-outline" message="No previous bookings" />
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSavedPlaces}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="bookmark" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.actionText}>Saved Places</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFavorites}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="heart" size={20} color="#EF4444" />
                </View>
                <Text style={styles.actionText}>Favorites</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSettings}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name="settings"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLogout}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: "#FEE2E2" },
                  ]}
                >
                  <Ionicons name="log-out" size={20} color="#EF4444" />
                </View>
                <Text style={[styles.actionText, { color: "#EF4444" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Avatar Picker */}
              <View style={styles.modalAvatarSection}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.modalAvatarContainer}
                >
                  <Image
                    source={{ uri: editAvatar || userProfile?.avatar_url }}
                    style={styles.modalAvatar}
                  />
                  <View style={styles.modalCameraButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.modalAvatarText}>Tap to change photo</Text>
              </View>

              <EditField
                label="First Name"
                value={editFirstName}
                onChangeText={setEditFirstName}
                icon="person"
              />
              <EditField
                label="Last Name"
                value={editLastName}
                onChangeText={setEditLastName}
                icon="person-outline"
              />
              <EditField
                label="Phone"
                value={editPhone}
                onChangeText={setEditPhone}
                icon="call"
                keyboardType="phone-pad"
              />
              <EditField
                label="Address"
                value={editAddress}
                onChangeText={setEditAddress}
                icon="location"
                multiline
              />
              <EditField
                label="Bio"
                value={editBio}
                onChangeText={setEditBio}
                icon="document-text"
                multiline
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowEditModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSave,
                  saving && styles.modalButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Helper Components
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function BookingCard({
  booking,
  statusColor,
  statusIcon,
}: {
  booking: Booking;
  statusColor: string;
  statusIcon: string;
}) {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.bookingName}>{booking.item_name}</Text>
          <Text style={styles.bookingType}>{booking.booking_type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Ionicons name={statusIcon as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{booking.booking_status}</Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetail}>
          <Ionicons name="cash" size={16} color={Colors.textSecondary} />
          <Text style={styles.bookingDetailText}>
            TK {booking.total_price.toLocaleString()}
          </Text>
        </View>
        <View style={styles.bookingDetail}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.bookingDetailText}>
            {new Date(booking.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.rewardEarned}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.rewardEarnedText}>
          +{Math.floor(booking.total_price / 100)} points earned
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ icon, message }: { icon: any; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color={Colors.textMuted} />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  icon,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: any;
  keyboardType?: any;
  multiline?: boolean;
}) {
  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      <View style={styles.editInputContainer}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <TextInput
          style={[styles.editInput, multiline && styles.editInputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
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
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  editButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F59E0B",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: Radii.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: Radii.md,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookingType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    textTransform: "capitalize",
  },
  bookingDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  bookingDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rewardEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    alignSelf: "flex-start",
  },
  rewardEarnedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xxl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  actionsCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalAvatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalAvatarContainer: {
    position: "relative",
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  modalCameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  modalAvatarText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  editField: {
    marginBottom: Spacing.lg,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  editInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#F9FAFB",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

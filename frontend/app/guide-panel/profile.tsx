import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { getSupabaseClient } from "@/lib/auth";

export default function GuideProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    hourly_rate: "",
    specializations: "",
    languages: "",
    avatar_url: "",
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const fetchGuideProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        setLoading(false);
        return;
      }

      // Fetch guide data
      const { data: guideData, error: guideError } = await supabase
        .from("guides")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (guideError) {
        console.log("Guide profile not found:", guideError);
      }

      const profileData = {
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        bio: userData?.bio || guideData?.bio || "",
        hourly_rate: guideData?.hourly_rate?.toString() || "",
        specializations: guideData?.specializations || "",
        languages: guideData?.languages || "",
        avatar_url: userData?.avatar_url || "",
      };

      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGuideProfile();
  }, [fetchGuideProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        Alert.alert("Error", "Database connection failed");
        return;
      }

      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          phone: editedProfile.phone,
          bio: editedProfile.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (userError) {
        console.error("User update error:", userError);
        throw userError;
      }

      // Update guides table
      const { error: guideError } = await supabase
        .from("guides")
        .update({
          hourly_rate: parseFloat(editedProfile.hourly_rate) || 0,
          specializations: editedProfile.specializations,
          languages: editedProfile.languages,
          bio: editedProfile.bio,
        })
        .eq("user_id", user?.id);

      if (guideError) {
        console.error("Guide update error:", guideError);
        // Don't throw - guide profile might not exist yet
      }

      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const supabase = await getSupabaseClient();
            if (supabase) {
              await supabase.auth.signOut();
            }
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            router.replace("/login");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(profile.first_name || "G").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.changePhotoBtn}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.userName}>
              {profile.first_name} {profile.last_name}
            </Text>
            <Text style={styles.userRole}>🎯 Professional Guide</Text>
          </View>

          {/* Profile Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={
                  isEditing ? editedProfile.first_name : profile.first_name
                }
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, first_name: text })
                }
                editable={isEditing}
                placeholder="Enter first name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editedProfile.last_name : profile.last_name}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, last_name: text })
                }
                editable={isEditing}
                placeholder="Enter last name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profile.email}
                editable={false}
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editedProfile.phone : profile.phone}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, phone: text })
                }
                editable={isEditing}
                placeholder="+880 1XXX-XXXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>

            <Text style={styles.sectionTitle}>Professional Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  !isEditing && styles.inputDisabled,
                ]}
                value={isEditing ? editedProfile.bio : profile.bio}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, bio: text })
                }
                editable={isEditing}
                placeholder="Tell travelers about yourself..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hourly Rate (৳)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={
                  isEditing ? editedProfile.hourly_rate : profile.hourly_rate
                }
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, hourly_rate: text })
                }
                editable={isEditing}
                placeholder="500"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specializations</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={
                  isEditing
                    ? editedProfile.specializations
                    : profile.specializations
                }
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, specializations: text })
                }
                editable={isEditing}
                placeholder="Historical tours, Food tours, etc."
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Languages</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editedProfile.languages : profile.languages}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, languages: text })
                }
                editable={isEditing}
                placeholder="Bengali, English, Hindi"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Settings Section */}
          {!isEditing && (
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#64748B"
                  />
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#64748B"
                  />
                  <Text style={styles.settingText}>Privacy & Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color="#64748B"
                  />
                  <Text style={styles.settingText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                  <Text style={[styles.settingText, styles.logoutText]}>
                    Logout
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    color: "#64748B",
    fontSize: 16,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.primary + "15",
  },
  editBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "600",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFF",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#64748B",
  },
  formSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#94A3B8",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontStyle: "italic",
  },
  settingsSection: {
    paddingHorizontal: Spacing.lg,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: Spacing.md,
    borderRadius: Radii.md,
    marginBottom: Spacing.sm,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: Spacing.md,
  },
  logoutText: {
    color: "#EF4444",
  },
});

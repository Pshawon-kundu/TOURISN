import { Colors, Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseClient } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function ToggleOnlineStatus() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guideId, setGuideId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentStatus();
  }, [user]);

  const fetchCurrentStatus = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      // Get guide ID
      const { data: guide } = await supabase
        .from("guides")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (guide) {
        setGuideId(guide.id);
        // Get online status
        const { data: status } = await supabase
          .from("guide_online_status")
          .select("is_online")
          .eq("guide_id", guide.id)
          .single();
        if (status) {
          setIsOnline(status.is_online);
        } else {
          setIsOnline(false);
        }
      }
    } catch (error) {
      setError("Failed to fetch status");
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (value: boolean) => {
    if (!guideId) return;
    setIsOnline(value);
    setError(null);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) return;
      // Upsert online status
      await supabase.from("guide_online_status").upsert(
        {
          guide_id: guideId,
          is_online: value,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "guide_id",
        },
      );
    } catch (error) {
      setIsOnline(!value); // Revert on error
      setError("Failed to update status");
      console.error("Error updating status:", error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <View style={styles.labelRow}>
            <Ionicons
              name={isOnline ? "wifi" : "wifi-outline"}
              size={20}
              color={isOnline ? "#10B981" : "#64748B"}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.label}>Online Status</Text>
          </View>
          <Text
            style={[
              styles.sublabel,
              { color: isOnline ? "#10B981" : "#64748B" },
            ]}
          >
            {isOnline ? "Available for bookings" : "Unavailable"}
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        <View style={styles.switchContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? "#10B981" : "#6B7280" },
            ]}
          />
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Switch
              value={isOnline}
              onValueChange={toggleStatus}
              trackColor={{ false: "#E5E7EB", true: Colors.primary }}
              thumbColor={isOnline ? "#FFF" : "#F3F4F6"}
              accessibilityLabel="Toggle online status"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sublabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 8,
  },
});

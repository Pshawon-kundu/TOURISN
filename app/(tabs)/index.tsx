import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.menuIconHeader}>☰</Text>
        </TouchableOpacity>

        <View style={styles.profileBadge}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>T</Text>
          </View>
          <View>
            <Text style={styles.headerGreeting}>Hi, Traveler</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButtonHeader}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, guides, hotels..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Popular Destinations</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            <DestinationQuickCard name="Cox's Bazar" emoji="🏖️" />
            <DestinationQuickCard name="Bandarban" emoji="⛰️" />
            <DestinationQuickCard name="Sylhet" emoji="🍃" />
            <DestinationQuickCard name="Sajek" emoji="☁️" />
          </ScrollView>
        </View>

        <View style={{ height: 90 }} />
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
                  <Text style={styles.drawerAvatarText}>T</Text>
                  <View style={styles.onlineIndicator} />
                </View>
                <Text style={styles.drawerName}>Hello, Traveler</Text>
                <Text style={styles.drawerSubtitle}>log In</Text>
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
                  title="Log Out"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/welcome");
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

function DestinationQuickCard({
  name,
  emoji,
}: {
  name: string;
  emoji: string;
}) {
  return (
    <View style={quickCardStyles.card}>
      <Text style={quickCardStyles.emoji}>{emoji}</Text>
      <ThemedText style={quickCardStyles.name}>{name}</ThemedText>
    </View>
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

const quickCardStyles = StyleSheet.create({
  card: {
    width: 120,
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
});

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
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
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
  content: { paddingBottom: 100 },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: Spacing.xs,
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

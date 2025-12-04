import { BottomPillNav } from "@/components/bottom-pill-nav";
import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <Header title="Profile" />
      <View style={styles.content}>
        <ThemedText type="subtitle">Traveler & Host profiles</ThemedText>
        <ThemedText>
          Rich profiles will show documents, reviews and availability.
        </ThemedText>
      </View>

      <BottomPillNav>
        <TouchableOpacity
          style={navStyles.navButton}
          onPress={() => router.push("/")}
        >
          <View style={navStyles.iconContainer}>
            <Text style={navStyles.icon}>🏠</Text>
            <ThemedText style={navStyles.label}>Home</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={navStyles.navButton}
          onPress={() => router.push("/explore")}
        >
          <View style={navStyles.iconContainer}>
            <Text style={navStyles.icon}>📖</Text>
            <ThemedText style={navStyles.label}>Explore</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={navStyles.navButton}
          onPress={() => router.push("/guides")}
        >
          <View style={navStyles.iconContainer}>
            <Text style={navStyles.icon}>🗺️</Text>
            <ThemedText style={navStyles.label}>Guides</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={navStyles.navButton}
          onPress={() => router.push("/chat")}
        >
          <View style={navStyles.iconContainer}>
            <Text style={navStyles.icon}>❤️</Text>
            <ThemedText style={navStyles.label}>Saved</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={navStyles.navButton}
          onPress={() => router.push("/profile")}
        >
          <View style={navStyles.iconContainer}>
            <Text style={navStyles.icon}>👤</Text>
            <ThemedText style={navStyles.label}>Profile</ThemedText>
          </View>
        </TouchableOpacity>
      </BottomPillNav>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
});

const navStyles = StyleSheet.create({
  navButton: {
    flex: 1,
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});

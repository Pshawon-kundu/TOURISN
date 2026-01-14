import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { DestinationCard } from "@/components/destination-card";
import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/design";

const DESTINATIONS = [
  {
    id: "cox",
    name: "Cox's Bazar Beach",
    imageUrl:
      "https://images.unsplash.com/photo-1589192471364-23e0c3b3f24e?w=800",
  },
  {
    id: "bandarban",
    name: "Bandarban Hills",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  },
  {
    id: "sylhet",
    name: "Sylhet Tea Gardens",
    imageUrl:
      "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=800",
  },
  {
    id: "sajek",
    name: "Sajek Valley",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  },
  {
    id: "dhaka",
    name: "Historic Dhaka",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
  },
  {
    id: "sundarbans",
    name: "Sundarbans Mangrove",
    imageUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
  },
];

export default function ExploreScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Explore Bangladesh" />
      {/* Smart Section intro */}
      <View style={{ marginBottom: Spacing.lg, marginTop: Spacing.md }}>
        <View
          style={{
            backgroundColor: "#e0f7fa",
            borderRadius: 18,
            padding: Spacing.lg,
            shadowColor: "#007AFF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                marginBottom: 8,
                color: "#007AFF",
                letterSpacing: 0.5,
              }}
            >
              Explore Bangladesh
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#374151",
                marginBottom: 6,
                fontWeight: "600",
              }}
            >
              Nature, culture, and adventure await you.
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", marginBottom: 2 }}>
              Cox's Bazar • Bandarban • Sylhet • Sajek • Dhaka • Sundarbans
            </Text>
            <Text style={{ fontSize: 13, color: "#475569" }}>
              Tap a card to view details, or add to favorites for your dream
              trip.
            </Text>
          </View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              overflow: "hidden",
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#007AFF",
            }}
          >
            <Ionicons name="flag" size={28} color="#007AFF" />
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Smart Hero destination */}
        <View style={{ marginBottom: Spacing.lg }}>
          <DestinationCard
            name={DESTINATIONS[0].name}
            imageUrl={DESTINATIONS[0].imageUrl}
            onPress={() => router.push("/experience")}
            onFavorite={() => toggleFavorite(DESTINATIONS[0].id)}
            isFavorited={favorites.has(DESTINATIONS[0].id)}
            large
            style={{
              borderWidth: 2,
              borderColor: "#007AFF",
              shadowColor: "#007AFF",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          />
        </View>

        {/* Smart Grid of destinations */}
        <View style={styles.grid}>
          {DESTINATIONS.slice(1).map((dest, idx) => (
            <View
              key={dest.id}
              style={[
                styles.gridItem,
                {
                  marginBottom: Spacing.md,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: idx % 2 === 0 ? "#f0f4ff" : "#e0f7fa",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  shadowColor: "#007AFF",
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                },
              ]}
            >
              <DestinationCard
                name={dest.name}
                imageUrl={dest.imageUrl}
                onPress={() => router.push("/experience")}
                onFavorite={() => toggleFavorite(dest.id)}
                isFavorited={favorites.has(dest.id)}
                style={{ borderRadius: 16 }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: 100 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
});

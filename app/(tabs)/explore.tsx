import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BottomPillNav } from "@/components/bottom-pill-nav";
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
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero destination */}
        <DestinationCard
          name={DESTINATIONS[0].name}
          imageUrl={DESTINATIONS[0].imageUrl}
          onPress={() => router.push("/guides")}
          onFavorite={() => toggleFavorite(DESTINATIONS[0].id)}
          isFavorited={favorites.has(DESTINATIONS[0].id)}
          large
        />

        {/* Grid of destinations */}
        <View style={styles.grid}>
          {DESTINATIONS.slice(1).map((dest) => (
            <View key={dest.id} style={styles.gridItem}>
              <DestinationCard
                name={dest.name}
                imageUrl={dest.imageUrl}
                onPress={() => router.push("/guides")}
                onFavorite={() => toggleFavorite(dest.id)}
                isFavorited={favorites.has(dest.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomPillNav />
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

import { BottomPillNav } from "@/components/bottom-pill-nav";
import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";

const MOCK_GUIDES = [
  {
    id: "g1",
    name: "Arif — Dhaka & Old Town",
    region: "Dhaka",
    price: "BDT 1,200/day",
  },
  {
    id: "g2",
    name: "Rana — Cox's Bazar beaches",
    region: "Cox's Bazar",
    price: "BDT 1,500/day",
  },
  {
    id: "g3",
    name: "Mina — Sylhet tea gardens",
    region: "Sylhet",
    price: "BDT 1,000/day",
  },
  {
    id: "g4",
    name: "Kamal — Bandarban hills",
    region: "Bandarban",
    price: "BDT 1,800/day",
  },
  {
    id: "g5",
    name: "Nadia — Sajek valley trek",
    region: "Sajek",
    price: "BDT 2,000/day",
  },
];

export default function GuidesScreen() {
  return (
    <ThemedView style={styles.container}>
      <Header title="Local Guides" />
      <FlatList
        data={MOCK_GUIDES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/guide/${item.id}`}>
            <Link.Trigger>
              <TouchableOpacity style={styles.item}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText>
                  {item.region} • {item.price}
                </ThemedText>
                <ThemedText>⭐ 4.8 • 120 reviews</ThemedText>
              </TouchableOpacity>
            </Link.Trigger>
          </Link>
        )}
      />
      <BottomPillNav />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  item: {
    padding: 12,
    borderRadius: 8,
  },
});

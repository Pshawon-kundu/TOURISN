import { BottomPillNav } from "@/components/bottom-pill-nav";
import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  item: {
    padding: 12,
    borderRadius: 8,
  },
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

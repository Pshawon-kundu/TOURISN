import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function Header({
  title,
  showBack = true,
}: {
  title: string;
  showBack?: boolean;
}) {
  const handleBackPress = () => {
    router.push("/(tabs)");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        {showBack && <View style={styles.placeholder} />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
});

import { Header } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function NidCheck() {
  return (
    <ThemedView style={styles.container}>
      <Header title="NID Check" />
      <View style={styles.content}>
        <ThemedText type="subtitle">Host verification (NID)</ThemedText>
        <ThemedText>
          Example flow: capture document, verify identity (mocked in this
          frontend).
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
});

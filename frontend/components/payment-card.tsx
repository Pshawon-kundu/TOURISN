import { Colors, Radii, Spacing } from "@/constants/design";
import React from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";

interface PaymentCardProps {
  cardNumber?: string;
  password?: string;
  expDate?: string;
  cvv?: string;
  onCardNumberChange?: (text: string) => void;
  onPasswordChange?: (text: string) => void;
}

export function PaymentCard({
  cardNumber = "",
  password = "",
  expDate = "",
  cvv = "",
  onCardNumberChange,
  onPasswordChange,
}: PaymentCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Payment Info:</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pay Number:</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={onCardNumberChange}
          placeholder="0000 0000 0000 0000"
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={onPasswordChange}
          placeholder="••••••••"
          secureTextEntry
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Exp. Date:</Text>
          <Text style={styles.valueText}>{expDate || "01/24"}</Text>
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>CCV:</Text>
          <Text style={styles.valueText}>{cvv || "454"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radii.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
});

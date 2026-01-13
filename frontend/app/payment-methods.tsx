import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Radii, Spacing } from "@/constants/design";
import { api } from "@/lib/api";

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: "card",
    last_four: "",
    card_brand: "",
    expiry_month: "",
    expiry_year: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response: any = await api.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to load payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newMethod.last_four || newMethod.last_four.length !== 4) {
      Alert.alert("Error", "Please enter the last 4 digits of your card");
      return;
    }

    setAdding(true);

    try {
      await api.addPaymentMethod({
        type: newMethod.type,
        last_four: newMethod.last_four,
        card_brand: newMethod.card_brand || undefined,
        expiry_month: newMethod.expiry_month
          ? parseInt(newMethod.expiry_month)
          : undefined,
        expiry_year: newMethod.expiry_year
          ? parseInt(newMethod.expiry_year)
          : undefined,
      });

      Alert.alert("Success", "Payment method added successfully");
      setShowAddModal(false);
      setNewMethod({
        type: "card",
        last_four: "",
        card_brand: "",
        expiry_month: "",
        expiry_year: "",
      });
      loadPaymentMethods();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add payment method");
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deletePaymentMethod(id);
              Alert.alert("Success", "Payment method removed successfully");
              loadPaymentMethods();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete payment method"
              );
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      default:
        return "card-outline";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="card-outline"
                size={64}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>No payment methods added</Text>
              <Text style={styles.emptySubtext}>
                Add a payment method to make bookings easier
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addButtonText}>Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Ionicons
                    name={getCardIcon(method.card_brand)}
                    size={32}
                    color={Colors.primary}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardBrand}>
                      {method.card_brand?.toUpperCase() ||
                        method.type.toUpperCase()}
                    </Text>
                    <Text style={styles.cardNumber}>
                      •••• {method.last_four}
                    </Text>
                    {method.expiry_month && method.expiry_year && (
                      <Text style={styles.cardExpiry}>
                        Expires {method.expiry_month}/{method.expiry_year}
                      </Text>
                    )}
                  </View>
                  {method.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleDeletePaymentMethod(method.id)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Brand</Text>
              <TextInput
                style={styles.input}
                value={newMethod.card_brand}
                onChangeText={(text) =>
                  setNewMethod({ ...newMethod, card_brand: text })
                }
                placeholder="Visa, Mastercard, etc."
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last 4 Digits *</Text>
              <TextInput
                style={styles.input}
                value={newMethod.last_four}
                onChangeText={(text) =>
                  setNewMethod({ ...newMethod, last_four: text })
                }
                placeholder="1234"
                placeholderTextColor={Colors.textMuted}
                maxLength={4}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>Expiry Month</Text>
                <TextInput
                  style={styles.input}
                  value={newMethod.expiry_month}
                  onChangeText={(text) =>
                    setNewMethod({ ...newMethod, expiry_month: text })
                  }
                  placeholder="MM"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={2}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Expiry Year</Text>
                <TextInput
                  style={styles.input}
                  value={newMethod.expiry_year}
                  onChangeText={(text) =>
                    setNewMethod({ ...newMethod, expiry_year: text })
                  }
                  placeholder="YYYY"
                  placeholderTextColor={Colors.textMuted}
                  maxLength={4}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, adding && styles.buttonDisabled]}
              onPress={handleAddPaymentMethod}
              disabled={adding}
            >
              {adding ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Add Payment Method</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    marginTop: Spacing.xl,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cardNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    marginRight: Spacing.md,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.xl,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: "row",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: Radii.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

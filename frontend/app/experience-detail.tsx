import { Colors, Radii, Spacing } from "@/constants/design";
import { experiences } from "@/constants/experiencesData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);

  const experience = experiences.find((exp) => exp.id === id);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Experience not found</Text>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981";
      case "moderate":
        return "#F59E0B";
      case "challenging":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const totalPrice = experience.price * quantity;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Image */}
        <Image source={{ uri: experience.image }} style={styles.image} />

        {/* Title & Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{experience.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD34D" />
            <Text style={styles.rating}>{experience.rating}</Text>
            <Text style={styles.reviews}>({experience.reviews} reviews)</Text>
          </View>
        </View>

        {/* Quick Info Boxes */}
        <View style={styles.infoBoxes}>
          <View style={styles.infoBox}>
            <Ionicons name="location" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Location</Text>
            <Text style={styles.infoBoxValue}>{experience.location}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="time" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Duration</Text>
            <Text style={styles.infoBoxValue}>{experience.duration}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="people" size={20} color="#667eea" />
            <Text style={styles.infoBoxLabel}>Group Size</Text>
            <Text style={styles.infoBoxValue}>{experience.groupSize}</Text>
          </View>
        </View>

        {/* Difficulty & Season */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Difficulty Level</Text>
            <View
              style={[
                styles.difficultyBadge,
                {
                  borderColor: getDifficultyColor(experience.difficulty),
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(experience.difficulty) },
                ]}
              >
                {experience.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Best Season</Text>
            <Text style={styles.detailValue}>
              {experience.bestSeason.join(", ")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Physical Requirement</Text>
            <Text style={styles.detailValue}>
              {experience.physicalRequirement}
            </Text>
          </View>

          {experience.minAge && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum Age</Text>
              <Text style={styles.detailValue}>{experience.minAge}+ years</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Experience</Text>
          <Text style={styles.description}>{experience.description}</Text>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {experience.highlights.map((highlight, idx) => (
            <View key={idx} style={styles.listItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.listText}>{highlight}</Text>
            </View>
          ))}
        </View>

        {/* Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {experience.included.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Ionicons name="checkmark" size={16} color="#10B981" />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Not Included */}
        {experience.notIncluded.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Not Included</Text>
            {experience.notIncluded.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Guide Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Guide</Text>
          <View style={styles.guideCard}>
            <Image
              source={{ uri: experience.guide.avatar }}
              style={styles.guideAvatar}
            />
            <View style={styles.guideDetails}>
              <Text style={styles.guideName}>{experience.guide.name}</Text>
              <Text style={styles.guideLanguages}>
                Languages: {experience.guide.languages.join(", ")}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="star" size={14} color="#FFD34D" />
                <Text style={styles.guideExperience}>
                  {experience.guide.rating} • {experience.guide.experience}{" "}
                  years experience
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <View style={styles.policyBox}>
            <Text style={styles.policyText}>{experience.cancellation}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Booking Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.quantitySection}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              quantity < experience.maxParticipants && setQuantity(quantity + 1)
            }
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {totalPrice.toLocaleString()} {experience.currency}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: Spacing.xxl * 3,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  backButton: {
    width: 60,
    paddingVertical: Spacing.sm,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },

  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#E5E7EB",
  },

  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },

  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
  },

  reviews: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  infoBoxes: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  infoBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },

  infoIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },

  infoBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },

  infoBoxValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  detailsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },

  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "right",
    flex: 1,
    marginLeft: Spacing.md,
  },

  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  difficultyText: {
    fontSize: 11,
    fontWeight: "700",
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  listIcon: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 2,
  },

  listText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },

  guideAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },

  guideDetails: {
    flex: 1,
  },

  guideName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  guideLanguages: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  guideExperience: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  policyBox: {
    backgroundColor: "rgba(102, 126, 234, 0.08)",
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.15)",
  },

  policyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },

  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  quantityButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  quantityButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  quantityValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    minWidth: 30,
    textAlign: "center",
  },

  priceSection: {
    flex: 1,
  },

  totalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  totalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#667eea",
    marginTop: 2,
  },

  bookButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },

  bookButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  errorText: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: 100,
  },
});

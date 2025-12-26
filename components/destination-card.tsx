import { Radii, Spacing } from "@/constants/design";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DestinationCardProps {
  name: string;
  imageUrl: string | ImageSourcePropType;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  large?: boolean;
  style?: any;
}

export function DestinationCard({
  name,
  imageUrl,
  onPress,
  onFavorite,
  isFavorited = false,
  large = false,
  style,
}: DestinationCardProps) {
  const imageSource =
    typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl;

  return (
    <TouchableOpacity
      style={[styles.card, large && styles.largeCard, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
      </View>

      {onFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={18}
            color={isFavorited ? "#ef4444" : "#ffffff"}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 140,
    borderRadius: Radii.lg,
    overflow: "hidden",
    marginRight: Spacing.md,
    position: "relative",
  },
  largeCard: {
    width: "100%",
    height: 280,
    marginRight: 0,
    marginBottom: Spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  content: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

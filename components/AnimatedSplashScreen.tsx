import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({
  onAnimationFinish,
}: AnimatedSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const letterAnims = useRef(
    "TOURISN".split("").map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Keep the native splash screen visible while we prepare
    SplashScreen.preventAutoHideAsync();

    // Start animations
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Fade in and scale the container
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate each letter sequentially
    const letterAnimations = letterAnims.map((anim, index) =>
      Animated.sequence([
        Animated.delay(800 + index * 100),
        Animated.spring(anim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.stagger(50, letterAnimations).start(() => {
      // After all animations complete, fade out and finish
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {
          await SplashScreen.hideAsync();
          onAnimationFinish();
        });
      }, 1000);
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.textContainer}>
          {"TOURISN".split("").map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.letter,
                {
                  opacity: letterAnims[index],
                  transform: [
                    {
                      translateY: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      scale: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
        <Animated.View
          style={[
            styles.underline,
            {
              opacity: letterAnims[letterAnims.length - 1],
              scaleX: letterAnims[letterAnims.length - 1],
            },
          ]}
        />
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: letterAnims[letterAnims.length - 1],
              transform: [
                {
                  translateY: letterAnims[letterAnims.length - 1].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Explore Your World
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  letter: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginHorizontal: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  underline: {
    width: width * 0.6,
    height: 4,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginBottom: 15,
  },
  tagline: {
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 3,
    opacity: 0.9,
  },
});

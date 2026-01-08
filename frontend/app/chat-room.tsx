/* eslint-disable import/no-unresolved */

import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import {
  getChatRoomId,
  initFirebase,
  sendMessage,
  subscribeToMessages,
} from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  from: string;
  userName?: string;
  createdAt: any;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const guideId = params.guideId as string | undefined;
  const guideName = params.guideName as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const listRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { user } = useAuth();

  const currentUserName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";
  const currentUserId = user?.uid || "anonymous";

  // Create chat room ID for this user-guide pair
  const chatRoomId = guideId
    ? getChatRoomId(currentUserId, guideId)
    : "general";

  useEffect(() => {
    (async () => {
      let config: any = null;
      try {
        // dynamic import to avoid build errors when the file is not present
        // eslint-disable-next-line import/no-unresolved
        // @ts-ignore: optional import (created by copying firebaseConfig.example.ts)
        const mod = await import("@/constants/firebaseConfig");
        config = mod.firebaseConfig;
      } catch {
        config = null;
      }

      if (!config) {
        setConnected(false);
        return;
      }

      const db = initFirebase(config);
      if (!db) {
        setConnected(false);
        return;
      }

      setConnected(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const chatPath = `chats/${chatRoomId}/messages`;
      const unsub = subscribeToMessages(chatPath, (msgs) => {
        setMessages(msgs as Message[]);
        setOnlineUsers(2); // User + Guide
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      });

      return () => unsub && unsub();
    })();
  }, [chatRoomId, fadeAnim, slideAnim]);

  async function onSend() {
    if (!text.trim()) return;
    try {
      const chatPath = `chats/${chatRoomId}/messages`;
      const userMessage = text.trim();

      // Send user message
      await sendMessage(chatPath, {
        text: userMessage,
        from: currentUserId,
        userName: currentUserName,
      });
      setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

      // Auto-reply from guide after 2 seconds
      setTimeout(async () => {
        const guideResponse = getGuideAutoResponse(userMessage);
        await sendMessage(chatPath, {
          text: guideResponse,
          from: guideId || "guide",
          userName: guideName || "Guide",
        });
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }, 2000);
    } catch (err) {
      console.warn("send failed", err);
    }
  }

  function getGuideAutoResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // Greeting responses
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "Hello! Thanks for reaching out. I'm here to help you plan your perfect tour. What would you like to know?";
    }

    // Booking related
    if (
      msg.includes("book") ||
      msg.includes("reserve") ||
      msg.includes("available")
    ) {
      return "I'd be happy to help you book a tour! I'm available most days. What dates are you considering?";
    }

    // Pricing
    if (
      msg.includes("price") ||
      msg.includes("cost") ||
      msg.includes("rate") ||
      msg.includes("fee")
    ) {
      return "My rate is $50/hour for standard tours. I also offer full-day packages at $350. Would you like more details?";
    }

    // Location/area
    if (
      msg.includes("where") ||
      msg.includes("location") ||
      msg.includes("area") ||
      msg.includes("place")
    ) {
      return "I specialize in tours around Dhaka, Sylhet, and Cox's Bazar. I can also arrange custom tours to other locations. Where would you like to explore?";
    }

    // Experience
    if (msg.includes("experience") || msg.includes("expertise")) {
      return "I have over 5 years of experience as a local guide. I specialize in cultural tours, historical sites, and food experiences. What interests you most?";
    }

    // Languages
    if (msg.includes("language") || msg.includes("speak")) {
      return "I'm fluent in English, Bangla, and Hindi. Communication won't be a problem!";
    }

    // Thanks
    if (msg.includes("thank") || msg.includes("thanks")) {
      return "You're welcome! Feel free to ask me anything else. I'm here to help make your trip memorable!";
    }

    // Default response
    const defaultResponses = [
      "That's a great question! Let me help you with that. Could you provide a bit more detail?",
      "I'd be happy to assist! Can you tell me more about what you're looking for?",
      "Sure! I have experience with that. What specific information do you need?",
      "Interesting! I can definitely help with that. Let me know your preferences.",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.from === currentUserId;
    const showName =
      !isMe && (index === 0 || messages[index - 1]?.from !== item.from);

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {showName && !isMe && (
          <Text style={styles.senderName}>{item.userName || "User"}</Text>
        )}
        <View style={[styles.msg, isMe ? styles.msgRight : styles.msgLeft]}>
          <Text
            style={[
              styles.msgText,
              isMe ? styles.myMsgText : styles.theirMsgText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMe ? styles.myTimeText : styles.theirTimeText,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="person" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.chatTitle}>{guideName || "Guide"}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Active now</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {!connected && (
          <View style={styles.notice}>
            <Ionicons
              name="warning"
              size={24}
              color="#FCD34D"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.noticeTitle}>Firebase Not Configured</Text>
            <Text style={styles.noticeText}>
              Create `constants/firebaseConfig.ts` from the example file and add
              your Firebase credentials to enable real-time chat.
            </Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.composer}>
          <TextInput
            placeholder={connected ? "Type a message..." : "Chat disabled"}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={text}
            onChangeText={setText}
            style={styles.input}
            editable={connected}
            multiline
            maxLength={500}
            onSubmitEditing={onSend}
          />
          <TouchableOpacity
            onPress={onSend}
            style={[styles.send, !connected && styles.sendDisabled]}
            disabled={!connected || !text.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    gap: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },

  chatTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  onlineText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },

  body: { flex: 1, backgroundColor: "#0F172A" },

  notice: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    alignItems: "center",
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FCD34D",
    marginBottom: 8,
  },

  noticeText: {
    color: "#FCD34D",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },

  myMessageContainer: {
    alignSelf: "flex-end",
  },

  theirMessageContainer: {
    alignSelf: "flex-start",
  },

  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
    marginLeft: Spacing.sm,
  },

  msg: {
    padding: Spacing.md,
    borderRadius: Radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 100,
  },

  msgLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 4,
  },

  msgRight: {
    backgroundColor: "#3B82F6",
    borderBottomRightRadius: 4,
  },

  msgText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 4,
  },

  myMsgText: {
    color: "#FFFFFF",
  },

  theirMsgText: {
    color: "#FFFFFF",
  },

  timeText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  myTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },

  theirTimeText: {
    color: "rgba(255, 255, 255, 0.6)",
  },

  composer: {
    flexDirection: "row",
    padding: Spacing.md,
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    gap: Spacing.sm,
  },

  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    maxHeight: 100,
  },

  send: {
    width: 44,
    height: 44,
    backgroundColor: "#3B82F6",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  sendDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    shadowOpacity: 0,
  },
});

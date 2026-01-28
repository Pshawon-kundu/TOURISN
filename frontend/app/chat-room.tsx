import { Colors, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import * as ChatApi from "@/lib/chat";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  from: string; // sender_id
  createdAt: any;
  isMe: boolean;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const otherUserId = (params.guideId || params.otherUserId) as
    | string
    | undefined;
  const otherUserName = (params.guideName || params.otherUserName) as
    | string
    | undefined;
  const roomIdProp = params.roomId as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(roomIdProp || null);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<FlatList>(null);
  const { user } = useAuth();
  const currentUserId = user?.id;

  const addUniqueMessages = (current: Message[], newMsgs: Message[]) => {
    const existingIds = new Set(current.map((m) => m.id));
    const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id));
    if (uniqueNew.length === 0) return current;
    return [...current, ...uniqueNew].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  };

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const initChat = async () => {
      if (!currentUserId) return;

      let activeRoomId = roomId;

      if (!activeRoomId && otherUserId) {
        try {
          const room = await ChatApi.getOrCreateChatRoom(otherUserId);
          if (room) {
            activeRoomId = room.id;
            setRoomId(room.id);
          } else {
            console.error("Failed to create room");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error init room:", error);
          setLoading(false);
          return;
        }
      }

      const finalRoomId = activeRoomId;
      if (!finalRoomId) {
        setLoading(false);
        return;
      }

      setConnected(true);

      try {
        const msgs = await ChatApi.getMessages(finalRoomId);
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            text: m.message,
            from: m.sender_id,
            createdAt: m.created_at,
            isMe: m.sender_id === currentUserId,
          })),
        );
        setLoading(false);
      } catch (error) {
        console.error("Error loading messages:", error);
        setLoading(false);
      }

      // Allow UI to breathe before scrolling
      setTimeout(() => listRef.current?.scrollToEnd(), 200);

      try {
        unsubscribe = await ChatApi.subscribeToChat(finalRoomId, (newMsg) => {
          setMessages((prev) => {
            const incomingMessage: Message = {
              id: newMsg.id,
              text: newMsg.message,
              from: newMsg.sender_id,
              createdAt: newMsg.created_at,
              isMe: newMsg.sender_id === currentUserId,
            };
            return addUniqueMessages(prev, [incomingMessage]);
          });
          setTimeout(() => listRef.current?.scrollToEnd(), 100);
        });
      } catch (error) {
        console.error("Error subscribing:", error);
      }
    };

    initChat();
    return () => unsubscribe();
  }, [otherUserId, currentUserId]);

  const handleSend = async () => {
    if (!text.trim() || !roomId || !currentUserId) return;

    const msgText = text.trim();
    setText("");

    // Optimistic UI Update
    const tempId = Date.now().toString();
    const optimisticMsg: Message = {
      id: tempId,
      text: msgText,
      from: currentUserId,
      createdAt: new Date().toISOString(),
      isMe: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => listRef.current?.scrollToEnd(), 100);

    try {
      const sentMsg = await ChatApi.sendMessage(roomId, msgText, currentUserId);
      if (sentMsg) {
        // Replace optimistic message or rely on subscription/refresh?
        // Since we have a real ID now, let's update if we want, but unique checker handles it.
        // Actually, if we just let the subscription or list refresh handle it, we might duplicate if not careful.
        // But "addUniqueMessages" handles ID based deduplication.
        // We should replace the temp ID with the real ID.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: sentMsg.id,
                  createdAt: sentMsg.created_at,
                }
              : m,
          ),
        );
      }
    } catch (error) {
      console.error("Send failed:", error);
      Alert.alert("Error", "Message failed to send");
      // Remove optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(msgText);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View
        style={[
          styles.messageBubble,
          item.isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isMe
              ? { color: "rgba(255,255,255,0.8)" }
              : { color: "#558B2F" },
          ]}
        >
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (loading && !connected) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{otherUserName || "Chat"}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  connected ? styles.statusOnline : styles.statusOffline,
                ]}
              />
              <Text style={styles.onlineStatus}>
                {connected ? "Active now" : "Connecting..."}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onLayout={() => listRef.current?.scrollToEnd()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              placeholderTextColor="#94A3B8"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !text.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Light gray/surface
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    height: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: "#10B981",
  },
  statusOffline: {
    backgroundColor: "#F59E0B",
  },
  onlineStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2E7D5A", // Guide's sent messages - Green
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9", // Received messages - Light green background
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#FFF", // White text for sent messages
    fontWeight: "500",
  },
  theirMessageText: {
    color: "#1B5E20", // Dark green text for received messages
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
});

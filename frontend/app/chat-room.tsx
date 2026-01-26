import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import * as ChatApi from "@/lib/chat"; // Use new Chat API
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

interface Message {
  id: string;
  text: string;
  from: string; // userId
  createdAt: any;
  isMe: boolean;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  // guideId param here represents the "other" user (Guide or Traveler)
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

  const listRef = useRef<FlatList>(null);
  const { user } = useAuth();

  const currentUserId = user?.id;

  // Deduplicate messages helper
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
      console.log("🔵 Initializing chat...");
      console.log("  Current User ID:", currentUserId);
      console.log("  Other User ID:", otherUserId);
      console.log("  Room ID Prop:", roomIdProp);
      console.log("  Room ID State:", roomId);

      if (!currentUserId) {
        console.log("❌ No current user ID, waiting...");
        return;
      }

      let activeRoomId = roomId;

      // If we don't have a room ID but have an other user ID, fetch/create room
      if (!activeRoomId && otherUserId) {
        console.log("📞 Creating/fetching chat room with:", otherUserId);
        try {
          const room = await ChatApi.getOrCreateChatRoom(otherUserId);
          console.log("✅ Room fetched/created:", room);
          if (room) {
            activeRoomId = room.id;
            setRoomId(room.id);
            console.log("✅ Room ID set:", room.id);
          } else {
            console.error("❌ Room creation returned null");
            Alert.alert(
              "Chat Room Error",
              "Failed to create chat room. Please check your connection and try again.",
              [
                { text: "Go Back", onPress: () => router.back() },
                { text: "Retry", onPress: () => initChat() },
              ],
            );
            return;
          }
        } catch (error) {
          console.error("❌ Error creating room:", error);
          Alert.alert(
            "Connection Error",
            "Failed to initialize chat. Please check your internet connection and try again.",
            [
              { text: "Go Back", onPress: () => router.back() },
              { text: "Retry", onPress: () => initChat() },
            ],
          );
          return;
        }
      }

      if (!activeRoomId) {
        console.error("❌ No active room ID after initialization");
        return;
      }

      setConnected(true);
      console.log("✅ Chat connected with room:", activeRoomId);

      // Load initial messages
      try {
        const msgs = await ChatApi.getMessages(activeRoomId);
        console.log(`📥 Loaded ${msgs.length} messages`);
        setMessages((prev) =>
          addUniqueMessages(
            prev,
            msgs.map((m) => ({
              id: m.id,
              text: m.message,
              from: m.sender_id,
              createdAt: m.created_at,
              isMe: m.sender_id === currentUserId,
            })),
          ),
        );
      } catch (error) {
        console.error("❌ Error loading messages:", error);
      }

      // Subscribe to real-time
      try {
        unsubscribe = await ChatApi.subscribeToChat(activeRoomId, (newMsg) => {
          console.log("📨 New message received:", newMsg);
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
          // Scroll to bottom
          setTimeout(() => listRef.current?.scrollToEnd(), 100);
        });
        console.log("✅ Subscribed to real-time updates");
      } catch (error) {
        console.error("❌ Error subscribing to chat:", error);
      }
    };

    initChat();

    return () => {
      unsubscribe();
    };
  }, [otherUserId, currentUserId]);

  const handleSend = async () => {
    console.log("🔵 Send button pressed");
    console.log("  Text:", text);
    console.log("  Room ID:", roomId);
    console.log("  User ID:", currentUserId);

    if (!text.trim()) {
      console.log("❌ No text to send");
      return;
    }

    if (!roomId) {
      console.log("❌ No room ID");
      alert("Chat room not initialized");
      return;
    }

    if (!currentUserId) {
      console.log("❌ No user ID - not logged in?");
      alert("Please log in to send messages");
      return;
    }

    const msgText = text.trim();
    setText("");

    try {
      console.log("📤 Sending message...");
      const sentMsg = await ChatApi.sendMessage(roomId, msgText, currentUserId);
      console.log("✅ Message sent:", sentMsg);

      // Optimistically add message to list if returned
      if (sentMsg) {
        setMessages((prev) => {
          const newMsg: Message = {
            id: sentMsg.id,
            text: sentMsg.message,
            from: sentMsg.sender_id,
            createdAt: sentMsg.created_at,
            isMe: true,
          };
          return addUniqueMessages(prev, [newMsg]);
        });
        setTimeout(() => listRef.current?.scrollToEnd(), 100);
      }
    } catch (error) {
      console.error("❌ Failed to send:", error);
      alert("Failed to send message. Check console for details.");
      setText(msgText); // Restore the text
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
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherUserName || "Chat"}</Text>
          {connected && <Text style={styles.onlineStatus}>Connected</Text>}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
            placeholderTextColor="#94A3B8"
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  onlineStatus: {
    fontSize: 12,
    color: "#10B981",
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#FFF",
  },
  theirMessageText: {
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
    alignSelf: "flex-end",
    color: "inherit",
  },
  inputContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: Spacing.md,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
});

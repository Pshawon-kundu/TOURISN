import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing } from "@/constants/design";
import { useAuth } from "@/hooks/use-auth";
import { ChatAPI, ChatMessage, getDisplayName } from "@/lib/chatApi";
import {
  getChatRoomId,
  initFirebase,
  sendMessage as sendFirebaseMessage,
  subscribeToMessages,
} from "@/lib/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  from: string;
  userName: string;
  createdAt: any;
  message_type?: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

export default function RealTimeChatScreen() {
  const params = useLocalSearchParams();
  const guideId = params.guideId as string | undefined;
  const guideName = params.guideName as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [useFirebase, setUseFirebase] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);

  const listRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pollIntervalRef = useRef<(() => void) | null>(null);

  const { user, loading: authLoading } = useAuth();

  const currentUserName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";
  const currentUserId = user?.uid || "anonymous";

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        Alert.alert("Login Required", "Please log in to chat with a guide.", [
          { text: "OK", onPress: () => router.push("/login") },
        ]);
        return;
      }
      initializeChat();
    }
    return () => {
      // Cleanup polling on unmount
      if (pollIntervalRef.current) {
        pollIntervalRef.current(); 
      }
    };
  }, [guideId, user, authLoading]);

  const initializeChat = async () => {
    if (!guideId) {
      Alert.alert("Error", "Guide ID is required");
      router.push("/(tabs)");
      return;
    }

    try {
      // First try to initialize Firebase
      let firebaseConfig: any = null;
      try {
        // @ts-ignore: optional import
        const mod = await import("@/constants/firebaseConfig");
        firebaseConfig = mod.firebaseConfig;
      } catch {
        firebaseConfig = null;
      }

      if (firebaseConfig) {
        await initializeFirebaseChat(firebaseConfig);
      } else {
        await initializeBackendChat();
      }
    } catch (error) {
      console.error("Chat initialization error:", error);
      Alert.alert("Error", "Failed to initialize chat");
    }
  };

  const initializeFirebaseChat = async (config: any) => {
    try {
      const db = initFirebase(config);
      if (!db) {
        throw new Error("Firebase initialization failed");
      }

      setUseFirebase(true);
      setConnected(true);

      const roomId = getChatRoomId(currentUserId, guideId!);
      setChatRoomId(roomId);

      const chatPath = `chats/${roomId}/messages`;
      const unsub = subscribeToMessages(chatPath, (msgs) => {
        const formattedMessages = msgs.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          from: msg.from,
          userName:
            msg.userName ||
            (msg.from === currentUserId ? currentUserName : guideName),
          createdAt: msg.createdAt,
        }));
        setMessages(formattedMessages);
        setOnlineUsers(2); // User + Guide
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      });

      setLoading(false);
      animateIn();

      return () => unsub && unsub();
    } catch (error) {
      console.warn("Firebase chat failed, falling back to backend:", error);
      await initializeBackendChat();
    }
  };

  const initializeBackendChat = async () => {
    try {
      if (user) {
        const token = await user.getIdToken();
        ChatAPI.setAuthToken(token);
      } else {
        throw new Error("User authentication required");
      }

      // Get or create chat room
      const room = await ChatAPI.getOrCreateChatRoom(guideId!);
      setChatRoomId(room.id);
      setUseFirebase(false);
      setConnected(true);

      // Load initial messages
      await loadMessages(room.id);

      // Start polling for new messages
      const stopPolling = ChatAPI.startMessagePolling(room.id, (chatMessages) => {
        const formattedMessages = chatMessages.map((msg: ChatMessage) => ({
          id: msg.id,
          text: msg.message,
          from: msg.sender_id,
          userName: getDisplayName(msg.sender),
          createdAt: new Date(msg.created_at),
          message_type: msg.message_type,
          sender: msg.sender,
        }));
        setMessages(formattedMessages);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      });
      pollIntervalRef.current = stopPolling as unknown as () => void; // Type assertion

      setLoading(false);
      animateIn();
    } catch (error) {
      console.error("Backend chat initialization failed:", error);
      setLoading(false);
      setConnected(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data: chatMessages } = await ChatAPI.getChatMessages(roomId);
      const formattedMessages = chatMessages.map((msg: ChatMessage) => ({
        id: msg.id,
        text: msg.message,
        from: msg.sender_id,
        userName: getDisplayName(msg.sender),
        createdAt: new Date(msg.created_at),
        message_type: msg.message_type,
        sender: msg.sender,
      }));
      setMessages(formattedMessages);

      // Mark messages as read
      await ChatAPI.markMessagesAsRead(roomId);
    } catch (error) {
      console.error("Load messages error:", error);
    }
  };

  const animateIn = () => {
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
  };

  const sendMessage = async () => {
    if (!text.trim() || sendingMessage || !chatRoomId) return;

    const messageText = text.trim();
    setText("");
    setSendingMessage(true);

    try {
      if (useFirebase) {
        const chatPath = `chats/${chatRoomId}/messages`;
        await sendFirebaseMessage(chatPath, {
          text: messageText,
          from: currentUserId,
          userName: currentUserName,
        });
      } else {
        await ChatAPI.sendMessage(chatRoomId, messageText);
      }

      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error("Send message error:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      setText(messageText); // Restore message text
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    if (timestamp.toDate) {
      return timestamp
        .toDate()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Connecting to chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.chatTitle}>{guideName || "Chat"}</Text>
                <View style={styles.onlineIndicator}>
                  <View style={[styles.onlineDot, connected ? styles.dotGreen : styles.dotGray]} />
                  <Text style={styles.onlineText}>
                    {connected ? "Active now" : "Connecting..."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            {!connected && (
              <View style={styles.notice}>
                <Ionicons
                  name="warning"
                  size={20}
                  color="#D97706"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.noticeText}>
                  Connection issue. Checking network...
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
          >
            <View style={styles.composer}>
              <TextInput
                placeholder={connected ? "Type a message..." : "Chat disabled"}
                placeholderTextColor="#9CA3AF"
                value={text}
                onChangeText={setText}
                style={styles.input}
                editable={connected}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[
                  styles.send,
                  (!connected || sendingMessage || !text.trim()) && styles.sendDisabled,
                ]}
                disabled={!connected || sendingMessage || !text.trim()}
              >
                {sendingMessage ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: "#6B7280",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
    borderRadius: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF", 
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: "#10B981",
  },
  dotGray: {
    backgroundColor: "#9CA3AF",
  },
  onlineText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  body: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  notice: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  noticeText: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "500",
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
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
    marginLeft: 12,
  },
  msg: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  msgLeft: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  msgRight: {
    backgroundColor: "#3B82F6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMsgText: {
    color: "#FFFFFF",
  },
  theirMsgText: {
    color: "#1F2937",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimeText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  theirTimeText: {
    color: "#9CA3AF",
  },
  composer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1F2937",
    fontSize: 15,
    maxHeight: 100,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  sendDisabled: {
    backgroundColor: "#E5E7EB",
  },
});

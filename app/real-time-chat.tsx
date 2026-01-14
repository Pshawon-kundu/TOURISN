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
import { Ionicons } from "@expo/vector-icons";
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

  const { user } = useAuth();

  const currentUserName =
    user?.displayName || user?.email?.split("@")[0] || "Guest";
  const currentUserId = user?.uid || "anonymous";

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup polling on unmount
      if (pollIntervalRef.current) {
        pollIntervalRef.current();
      }
    };
  }, [guideId]);

  const initializeChat = async () => {
    if (!guideId) {
      Alert.alert("Error", "Guide ID is required");
      router.back();
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
      // Set auth token if available (you might need to implement this based on your auth system)
      // ChatAPI.setAuthToken(user?.accessToken);

      // Get or create chat room
      const room = await ChatAPI.getOrCreateChatRoom(guideId!);
      setChatRoomId(room.id);
      setUseFirebase(false);
      setConnected(true);

      // Load initial messages
      await loadMessages(room.id);

      // Start polling for new messages
      pollIntervalRef.current = ChatAPI.startMessagePolling(
        room.id,
        (chatMessages) => {
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
          setTimeout(
            () => listRef.current?.scrollToEnd({ animated: true }),
            100
          );
        }
      );

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
      // Firebase timestamp
      return timestamp
        .toDate()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      // Regular date
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
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Connecting to chat...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
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
                size={24}
                color="#FCD34D"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.noticeTitle}>Connection Issue</Text>
              <Text style={styles.noticeText}>
                Having trouble connecting to chat. Please check your internet
                connection.
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
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.send,
                (!connected || sendingMessage) && styles.sendDisabled,
              ]}
              disabled={!connected || sendingMessage}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
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
    fontWeight: "500",
  },
  body: {
    flex: 1,
  },
  notice: {
    backgroundColor: "rgba(252, 211, 77, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(252, 211, 77, 0.2)",
    borderRadius: Radii.lg,
    padding: Spacing.md,
    margin: Spacing.md,
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
    shadowRadius: 3,
    elevation: 2,
  },
  msgLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    lineHeight: 20,
    fontWeight: "500",
  },
  myMsgText: {
    color: "#FFFFFF",
  },
  theirMsgText: {
    color: "#FFFFFF",
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "400",
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
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendDisabled: {
    backgroundColor: "rgba(59, 130, 246, 0.5)",
  },
});

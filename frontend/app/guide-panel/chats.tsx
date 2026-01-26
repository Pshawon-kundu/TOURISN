import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/design";
import * as ChatApi from "@/lib/chat";

export default function GuideChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChats = async () => {
    setLoading(true);
    try {
      const rooms = await ChatApi.getUserChatRooms();
      setChats(rooms);
      setFilteredChats(rooms);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredChats(chats);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = chats.filter((chat) => {
      const otherUser = chat.other_user || {};
      const name =
        `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.toLowerCase();
      const email = (otherUser.email || "").toLowerCase();
      const lastMessage = (chat.last_message || "").toLowerCase();

      return (
        name.includes(lowercaseQuery) ||
        email.includes(lowercaseQuery) ||
        lastMessage.includes(lowercaseQuery)
      );
    });
    setFilteredChats(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, []),
  );

  const renderItem = ({ item }: { item: any }) => {
    const otherUser = item.other_user || {};
    const name = otherUser.first_name
      ? `${otherUser.first_name} ${otherUser.last_name || ""}`.trim()
      : otherUser.email || "Unknown User";

    const lastMsgTime = item.last_message_at
      ? new Date(item.last_message_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    // Get initials for avatar
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    // Determine if message is unread (you can add actual unread logic here)
    const unreadCount = item.unread_count || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.chatItem, hasUnread && styles.chatItemUnread]}
        onPress={() =>
          router.push({
            pathname: "/chat-room",
            params: {
              roomId: item.id,
              guideName: name,
              guideId: otherUser.id,
            },
          })
        }
        activeOpacity={0.7}
      >
        <View
          style={[styles.avatarContainer, hasUnread && styles.avatarUnread]}
        >
          <Text style={styles.avatarText}>{initials || "?"}</Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.userName, hasUnread && styles.userNameUnread]}>
              {name}
            </Text>
            {lastMsgTime && (
              <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                {lastMsgTime}
              </Text>
            )}
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.last_message || "Start a conversation"}
            </Text>
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {filteredChats.length} conversation
          {filteredChats.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          placeholder="Search travelers..."
          style={styles.searchInput}
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchChats();
            }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#CBD5E1"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No results found" : "No conversations yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No conversations match "${searchQuery}"`
                  : "When travelers contact you, their messages will appear here"}
              </Text>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    padding: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: Spacing.md,
    marginBottom: 2,
    borderRadius: Radii.md,
  },
  chatItemUnread: {
    backgroundColor: "#F0F9FF",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarUnread: {
    backgroundColor: Colors.primary,
    borderColor: "#DBEAFE",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4C51BF",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 8,
  },
  timeUnread: {
    color: Colors.primary,
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  separator: {
    height: 2,
    backgroundColor: "transparent",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});

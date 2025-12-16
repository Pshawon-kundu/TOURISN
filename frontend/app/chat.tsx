/* eslint-disable import/no-unresolved */

import { Header } from "@/components/header";
import { ThemedView } from "@/components/themed-view";
import { initFirebase, sendMessage, subscribeToMessages } from "@/lib/firebase";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef<FlatList>(null);

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
      const unsub = subscribeToMessages("chats/general", (msgs) => {
        setMessages(msgs as any[]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      });

      return () => unsub && unsub();
    })();
  }, []);

  async function onSend() {
    if (!text.trim()) return;
    try {
      await sendMessage("chats/general", {
        text: text.trim(),
        from: "traveler",
      });
      setText("");
    } catch (err) {
      console.warn("send failed", err);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Header title="Safe Chat" />
      <View style={styles.body}>
        {!connected && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Firebase not configured. Create `constants/firebaseConfig.ts` from
              `constants/firebaseConfig.example.ts` and add your Firebase values
              to enable realtime chat.
            </Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.msg,
                item.from === "traveler" ? styles.msgRight : styles.msgLeft,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  item.from === "traveler"
                    ? { color: "#fff" }
                    : { color: "#111" },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.composer}>
          <TextInput
            placeholder={
              connected ? "Type a message" : "Configure Firebase to enable chat"
            }
            value={text}
            onChangeText={setText}
            style={styles.input}
            editable={connected}
          />
          <TouchableOpacity
            onPress={onSend}
            style={styles.send}
            disabled={!connected}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  notice: { padding: 12, backgroundColor: "#FFF4E5" },
  noticeText: { color: "#663C00" },
  list: { padding: 12 },
  msg: { maxWidth: "80%", padding: 10, borderRadius: 12, marginVertical: 4 },
  msgLeft: { backgroundColor: "#F1F1F1", alignSelf: "flex-start" },
  msgRight: { backgroundColor: "#2E7D5A", alignSelf: "flex-end" },
  msgText: { color: "#fff" },
  composer: { flexDirection: "row", padding: 8, alignItems: "center" },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  send: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    marginLeft: 8,
  },
  sendText: { color: "#fff" },
});

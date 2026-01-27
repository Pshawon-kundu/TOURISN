import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";
import { fetchChatMessages, fetchChatRooms, sendChatMessage } from "../lib/api";

interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at: string;
  other_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export function ChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get Current User
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        // Also get the user's database ID
        const { data: userRecord } = await supabase
          .from("users")
          .select("id")
          .eq("email", data.user.email)
          .single();
        if (userRecord) {
          setDbUserId(userRecord.id);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch Rooms using Backend API (bypasses RLS)
  useEffect(() => {
    if (currentUser) {
      loadRooms();
    }
  }, [currentUser]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to New Messages & Fetch History when Room Changes
  useEffect(() => {
    if (!selectedRoomId) return;

    loadMessages(selectedRoomId);

    // Subscribe to new messages via Supabase Realtime
    const channel = supabase
      .channel(`room:${selectedRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${selectedRoomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Update last message in room list
          setRooms((prev) =>
            prev
              .map((r) =>
                r.id === selectedRoomId
                  ? {
                      ...r,
                      last_message: newMsg.message,
                      last_message_at: newMsg.created_at,
                    }
                  : r,
              )
              .sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime(),
              ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoomId]);

  const loadRooms = async () => {
    try {
      console.log("Fetching rooms via API...");
      const response = await fetchChatRooms();

      if (response.success && response.data) {
        console.log("Rooms loaded:", response.data.length, response.data);
        setRooms(response.data);
      } else {
        console.error("Failed to load rooms:", response.error);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetchChatMessages(roomId);

      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        console.error("Failed to load messages:", response.error);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;

    const tempMsg = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const response = await sendChatMessage(selectedRoomId, tempMsg);

      if (!response.success) {
        console.error("Failed to send message:", response.error);
        setNewMessage(tempMsg); // Restore on failure
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(tempMsg);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        height: "calc(100vh - 100px)",
        gap: "20px",
      }}
    >
      {/* Sidebar: Chat List */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}
        >
          <h3 style={{ margin: 0 }}>Messages</h3>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading && (
            <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
              Loading conversations...
            </div>
          )}
          {rooms.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
              No conversations yet
            </div>
          )}
          {rooms.map((room) => {
            const otherUser = room.other_user;
            const name = otherUser
              ? `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() ||
                otherUser.email ||
                "Unknown User"
              : "Unknown User";

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedRoomId === room.id
                      ? "var(--primary-light)"
                      : "transparent",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {room.last_message || "No messages yet"}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                    }}
                  >
                    {room.last_message_at
                      ? new Date(room.last_message_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main: Chat Messages */}
      <div
        className="card"
        style={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {selectedRoom.other_user?.first_name?.charAt(0).toUpperCase() ||
                  "?"}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>
                  {selectedRoom.other_user
                    ? `${selectedRoom.other_user.first_name || ""} ${selectedRoom.other_user.last_name || ""}`.trim()
                    : "Unknown User"}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--success)" }}>
                  Tourist
                </span>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{ textAlign: "center", color: "#888", padding: 40 }}
                >
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === dbUserId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: isMe
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        backgroundColor: isMe
                          ? "var(--primary)"
                          : "var(--card-bg)",
                        color: isMe ? "#fff" : "inherit",
                        border: isMe ? "none" : "1px solid var(--border)",
                      }}
                    >
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      <span
                        style={{
                          fontSize: "10px",
                          opacity: 0.7,
                          display: "block",
                          marginTop: 4,
                          textAlign: "right",
                        }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "24px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text)",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: "24px",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 16,
                  opacity: 0.5,
                }}
              >
                💬
              </div>
              Select a conversation to start chatting
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

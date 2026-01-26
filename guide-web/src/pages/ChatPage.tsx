import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";

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
    email: string;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get Current User
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // Fetch Rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to New Messages & Fetch History when Room Changes
  useEffect(() => {
    if (!selectedRoomId) return;

    fetchMessages(selectedRoomId);

    // Subscribe to new messages
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
            // Avoid duplicates if any
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

  const fetchRooms = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Fetch chat rooms where the guide is either user1 or user2
      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          user1:user1_id (id, first_name, last_name, email),
          user2:user2_id (id, first_name, last_name, email)
        `,
        )
        .or(`user1_id.eq.${userData.user.id},user2_id.eq.${userData.user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Process rooms to identify the other user
      const processedRooms = (rooms || []).map((room) => {
        const otherUser =
          room.user1_id === userData.user.id ? room.user2 : room.user1;
        return {
          ...room,
          other_user: otherUser,
        };
      });

      setRooms(processedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId || !currentUser) return;

    const tempMsg = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const { error } = await supabase.from("chat_messages").insert({
        room_id: selectedRoomId,
        sender_id: currentUser.id,
        message: tempMsg,
        is_read: false,
      });

      if (error) throw error;

      // Update last message in room
      await supabase
        .from("chat_rooms")
        .update({
          last_message: tempMsg,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", selectedRoomId);
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
          {rooms.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
              No conversations yet
            </div>
          )}
          {rooms.map((room) => {
            const otherUser = room.other_user;
            const name = otherUser
              ? `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim() ||
                otherUser.email
              : "Unknown User";
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background:
                    selectedRoomId === room.id
                      ? "var(--accent-light)"
                      : "transparent",
                  borderLeft:
                    selectedRoomId === room.id
                      ? "4px solid var(--accent)"
                      : "4px solid transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {new Date(room.last_message_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    color: "var(--muted)",
                  }}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "200px",
                    }}
                  >
                    {room.last_message || "No messages"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div
        className="card"
        style={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedRoomId ? (
          <>
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-secondary)",
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
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {(
                    selectedRoom?.other_user?.first_name?.[0] || "U"
                  ).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {selectedRoom?.other_user
                      ? `${selectedRoom.other_user.first_name} ${selectedRoom.other_user.last_name}`
                      : "Chat"}
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--success)" }}>
                    ● Online
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                background: "#f8fafc",
              }}
            >
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: isMe ? "var(--accent)" : "white",
                        color: isMe ? "white" : "var(--text-primary)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        borderBottomRightRadius: isMe ? "4px" : "12px",
                        borderBottomLeftRadius: isMe ? "12px" : "4px",
                      }}
                    >
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      <span
                        style={{
                          fontSize: "10px",
                          opacity: 0.7,
                          display: "block",
                          marginTop: "4px",
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

            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "12px",
                background: "white",
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!newMessage.trim()}
                style={{
                  padding: "0 24px",
                  borderRadius: "8px",
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
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}
            >
              💬
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

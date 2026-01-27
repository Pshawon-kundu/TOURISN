import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Stats {
  totalUsers: number;
  activeGuides: number;
  pendingGuides: number;
  totalBookings: number;
  totalTransportBookings: number;
  monthlyRevenue: string;
  lastUpdated: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Booking {
  id: string;
  status: string;
  total_price: string;
  start_date: string;
  end_date: string;
  created_at: string;
  users?: { full_name: string; email: string };
  guides?: { full_name: string };
}

interface Guide {
  id: string;
  full_name: string;
  status: string;
  specializations: string[];
  per_hour_rate: string;
  created_at: string;
  users?: { email: string };
}

interface Activity {
  type: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  stats: Stats | null;
  recentUsers: User[];
  recentBookings: Booking[];
  recentGuides: Guide[];
  activities: Activity[];
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
  stats: null,
  recentUsers: [],
  recentBookings: [],
  recentGuides: [],
  activities: [],
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentGuides, setRecentGuides] = useState<Guide[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Connect to Socket.IO server
    const socketInstance = io("http://localhost:5001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to real-time server");
      setIsConnected(true);
      addActivity({
        type: "system",
        message: "Connected to real-time server",
        timestamp: new Date().toISOString(),
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from real-time server");
      setIsConnected(false);
      addActivity({
        type: "system",
        message: "Disconnected from server",
        timestamp: new Date().toISOString(),
      });
    });

    // Listen for initial data
    socketInstance.on("initial-data", (data) => {
      console.log("📊 Received initial data:", data);
      if (data.stats) setStats(data.stats);
      if (data.recentUsers) setRecentUsers(data.recentUsers);
      if (data.recentBookings) setRecentBookings(data.recentBookings);
      if (data.recentGuides) setRecentGuides(data.recentGuides);
    });

    // Listen for stats updates
    socketInstance.on("stats-update", (newStats) => {
      console.log("📊 Stats updated:", newStats);
      setStats(newStats);
    });

    // Listen for user activities
    socketInstance.on("user-activity", (activity) => {
      console.log("👤 User activity:", activity);
      addActivity({
        type: "user",
        message: `User ${activity.type}: ${activity.data?.email || "Unknown"}`,
        timestamp: activity.timestamp,
        data: activity.data,
      });
    });

    // Listen for user login
    socketInstance.on("user-login", (data) => {
      console.log("🔐 User logged in:", data);
      addActivity({
        type: "login",
        message: `${
          data.userData?.full_name || data.userData?.email
        } logged in`,
        timestamp: data.timestamp,
        data: data.userData,
      });
    });

    // Listen for user signup
    socketInstance.on("user-signup", (data) => {
      console.log("📝 User signed up:", data);
      addActivity({
        type: "signup",
        message: `New user registered: ${
          data.userData?.full_name || data.userData?.email
        }`,
        timestamp: data.timestamp,
        data: data.userData,
      });
      // Add to recent users
      if (data.userData) {
        setRecentUsers((prev) => [data.userData, ...prev].slice(0, 10));
      }
    });

    // Listen for guide activities
    socketInstance.on("guide-activity", (activity) => {
      console.log("🎒 Guide activity:", activity);
      addActivity({
        type: "guide",
        message: `Guide ${activity.type}: ${
          activity.data?.full_name || "Unknown"
        }`,
        timestamp: activity.timestamp,
        data: activity.data,
      });
    });

    // Listen for booking activities
    socketInstance.on("booking-activity", (activity) => {
      console.log("📅 Booking activity:", activity);
      addActivity({
        type: "booking",
        message: `Booking ${activity.type}: ${activity.data?.id || "Unknown"}`,
        timestamp: activity.timestamp,
        data: activity.data,
      });
    });

    // Listen for transport activities
    socketInstance.on("transport-activity", (activity) => {
      console.log("🚗 Transport activity:", activity);
      addActivity({
        type: "transport",
        message: `Transport ${activity.type}`,
        timestamp: activity.timestamp,
        data: activity.data,
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
  }, []);

  const addActivity = (activity: Activity) => {
    setActivities((prev) => [activity, ...prev].slice(0, 50)); // Keep last 50 activities
  };

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        isConnected,
        stats,
        recentUsers,
        recentBookings,
        recentGuides,
        activities,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

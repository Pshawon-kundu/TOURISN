import { RealtimeChannel } from "@supabase/supabase-js";
import { Server as SocketIOServer } from "socket.io";
import { supabase } from "../config/database";

let io: SocketIOServer | null = null;
const channels: RealtimeChannel[] = [];

export const initializeRealtimeService = (socketServer: SocketIOServer) => {
  io = socketServer;
  console.log("🔌 Real-time service initialized");

  // Set up Supabase real-time listeners
  setupSupabaseListeners();

  // Handle Socket.IO connections
  io.on("connection", (socket) => {
    console.log(`✅ Admin client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Admin client disconnected: ${socket.id}`);
    });

    // Send initial data when admin connects
    sendInitialData(socket);
  });
};

const setupSupabaseListeners = () => {
  console.log("🎧 Setting up Supabase real-time listeners...");

  // Listen to users table changes
  const usersChannel = supabase
    .channel("users-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
      },
      async (payload) => {
        console.log("📊 Users table change detected:", payload.eventType);

        if (io) {
          // Get updated stats
          const stats = await getSystemStats();

          io.emit("user-activity", {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          });

          io.emit("stats-update", stats);
        }
      }
    )
    .subscribe((status) => {
      console.log("👥 Users channel status:", status);
    });

  channels.push(usersChannel);

  // Listen to guides table changes
  const guidesChannel = supabase
    .channel("guides-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "guides",
      },
      async (payload) => {
        console.log("📊 Guides table change detected:", payload.eventType);

        if (io) {
          const stats = await getSystemStats();

          io.emit("guide-activity", {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          });

          io.emit("stats-update", stats);
        }
      }
    )
    .subscribe((status) => {
      console.log("🎒 Guides channel status:", status);
    });

  channels.push(guidesChannel);

  // Listen to bookings table changes
  const bookingsChannel = supabase
    .channel("bookings-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
      },
      async (payload) => {
        console.log("📊 Bookings table change detected:", payload.eventType);

        if (io) {
          const stats = await getSystemStats();

          io.emit("booking-activity", {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          });

          io.emit("stats-update", stats);
        }
      }
    )
    .subscribe((status) => {
      console.log("📅 Bookings channel status:", status);
    });

  channels.push(bookingsChannel);

  // Listen to transport_bookings table changes
  const transportChannel = supabase
    .channel("transport-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transport_bookings",
      },
      async (payload) => {
        console.log("📊 Transport table change detected:", payload.eventType);

        if (io) {
          io.emit("transport-activity", {
            type: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          });
        }
      }
    )
    .subscribe((status) => {
      console.log("🚗 Transport channel status:", status);
    });

  channels.push(transportChannel);

  console.log("✅ All Supabase real-time listeners established");
};

const sendInitialData = async (socket: any) => {
  try {
    const stats = await getSystemStats();
    const recentUsers = await getRecentUsers();
    const recentBookings = await getRecentBookings();
    const recentGuides = await getRecentGuides();

    socket.emit("initial-data", {
      stats,
      recentUsers,
      recentBookings,
      recentGuides,
      timestamp: new Date().toISOString(),
    });

    console.log("📤 Initial data sent to admin client");
  } catch (error) {
    console.error("❌ Error sending initial data:", error);
  }
};

// Helper functions to get data
const getSystemStats = async () => {
  try {
    const [usersResult, guidesResult, bookingsResult, transportResult] =
      await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("guides").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase
          .from("transport_bookings")
          .select("*", { count: "exact", head: true }),
      ]);

    // Get active guides (approved status)
    const { count: activeGuidesCount } = await supabase
      .from("guides")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Get pending guides
    const { count: pendingGuidesCount } = await supabase
      .from("guides")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Calculate monthly revenue (this month's bookings)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyBookings } = await supabase
      .from("bookings")
      .select("total_price")
      .gte("created_at", startOfMonth.toISOString());

    const monthlyRevenue =
      monthlyBookings?.reduce(
        (sum, booking) => sum + (parseFloat(booking.total_price) || 0),
        0
      ) || 0;

    return {
      totalUsers: usersResult.count || 0,
      activeGuides: activeGuidesCount || 0,
      pendingGuides: pendingGuidesCount || 0,
      totalBookings: bookingsResult.count || 0,
      totalTransportBookings: transportResult.count || 0,
      monthlyRevenue: `$${monthlyRevenue.toFixed(2)}`,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error getting system stats:", error);
    return null;
  }
};

const getRecentUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, created_at, role")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting recent users:", error);
    return [];
  }
};

const getRecentBookings = async () => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        total_price,
        start_date,
        end_date,
        created_at,
        users:traveler_id (full_name, email),
        guides:guide_id (full_name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting recent bookings:", error);
    return [];
  }
};

const getRecentGuides = async () => {
  try {
    const { data, error } = await supabase
      .from("guides")
      .select(
        `
        id,
        full_name,
        status,
        specializations,
        hourly_rate,
        created_at,
        users:user_id (email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error getting recent guides:", error);
    return [];
  }
};

// Cleanup function
export const cleanupRealtimeService = () => {
  console.log("🧹 Cleaning up real-time service...");
  channels.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  channels.length = 0;
};

// Export functions for manual triggering
export const emitUserLogin = async (userId: string, userData: any) => {
  if (io) {
    const stats = await getSystemStats();

    io.emit("user-login", {
      userId,
      userData,
      timestamp: new Date().toISOString(),
    });

    io.emit("stats-update", stats);

    console.log(`📢 User login emitted: ${userData.email}`);
  }
};

export const emitUserSignup = async (userData: any) => {
  if (io) {
    const stats = await getSystemStats();

    io.emit("user-signup", {
      userData,
      timestamp: new Date().toISOString(),
    });

    io.emit("stats-update", stats);

    console.log(`📢 User signup emitted: ${userData.email}`);
  }
};

export { io };

import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";

// Icons
const Icons = {
  Calendar: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Chat: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Star: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Wallet: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path>
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
    </svg>
  ),
  Users: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Activity: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  Power: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
      <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
  ),
  Clock: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
};

function formatNumber(num: number) {
  return num ? num.toLocaleString() : "0";
}

export function DashboardPage() {
  const { stats, recentBookings, recentGuides, activities, isConnected } =
    useRealtime();
  const { user } = useAuth();

  const [guideId, setGuideId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [guideStatus, setGuideStatus] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      fetchGuideStatus();
    }
  }, [user]);

  const fetchGuideStatus = async () => {
    try {
      // Get internal user ID from auth_id
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!userData) return;

      const { data: guideData } = await supabase
        .from("guides")
        .select("id, status")
        .eq("user_id", userData.id)
        .single();

      if (guideData) {
        setGuideId(guideData.id);
        setGuideStatus(guideData.status);

        const { data: onlineData } = await supabase
          .from("guide_online_status")
          .select("is_online")
          .eq("guide_id", guideData.id)
          .single();

        if (onlineData) {
          setIsOnline(onlineData.is_online);
        }
      }
    } catch (error) {
      console.error("Error fetching guide status:", error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!guideId) return;

    setLoadingStatus(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("No token");

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5001/api";

      const response = await fetch(`${API_URL}/guides/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guideId,
          isOnline: !isOnline,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setIsOnline(!isOnline);
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      {/* Hero Section */}
      <div
        className="hero-gradient"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.4))",
          border: "1px solid rgba(16, 185, 129, 0.2)"
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#ECFDF5" }}>
            Welcome back, Guide 👋
          </h2>
          <p className="muted" style={{ margin: "8px 0 0", fontSize: "16px", color: "#A7F3D0", display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Calendar />
            {currentDate}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", fontSize: "14px", color: isConnected ? "#34D399" : "#F87171" }}>
             <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isConnected ? "#10b981" : "#ef4444",
                  display: "inline-block"
                }}
              />
              {isConnected ? "System Connected" : "Connection Lost"}
          </div>
        </div>

        <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <button
            onClick={toggleOnlineStatus}
            disabled={loadingStatus || guideStatus !== "approved"}
            style={{
              padding: "16px 32px",
              borderRadius: "16px",
              border: "none",
              background: isOnline 
                ? "linear-gradient(135deg, #EF4444, #B91C1C)" 
                : "linear-gradient(135deg, #10B981, #059669)",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              cursor: loadingStatus || guideStatus !== "approved" ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              opacity: guideStatus !== "approved" ? 0.7 : 1,
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease",
            }}
          >
            <Icons.Power />
            {loadingStatus
              ? "Updating..."
              : isOnline
                ? "Go Offline"
                : "Go Online"}
          </button>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 6, 
            background: "rgba(0,0,0,0.3)", 
            padding: "6px 12px", 
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <span style={{ 
              width: 8, height: 8, borderRadius: "50%", 
              background: guideStatus === 'approved' ? '#10B981' : '#F59E0B' 
            }} />
            <span style={{ fontSize: "12px", color: "white", fontWeight: 500 }}>
              {guideStatus === "pending"
                ? "Approval Pending"
                : guideStatus === "approved" 
                  ? "Verified Guide" 
                  : "Status: " + guideStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}> 
        <StatCard
          label="Pending Requests"
          value={formatNumber(stats?.pendingGuides || 0)} // Using pending bookings count if available or similar
          trend="Needs attention"
          icon={<Icons.Calendar />}
        />
        <StatCard
          label="Active Chats"
          value={formatNumber(0)} // Placeholder or stats.activeChats
          trend="Travelers waiting"
          icon={<Icons.Chat />}
        />
        <StatCard
          label="Rating"
          value="4.9" // Placeholder
          trend="Top 5% of guides"
          icon={<Icons.Star />}
        />
         <StatCard
          label="Earnings"
          value={stats?.monthlyRevenue || "$0.00"}
          trend="This month"
          icon={<Icons.Wallet />}
        />
      </div>  {/* End Stats Grid */}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Recent Bookings */}
        <div className="card" style={{ minHeight: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
              <Icons.Calendar /> Recent Bookings
            </h3>
            <button className="btn-ghost" style={{ fontSize: "13px" }}>View All</button>
          </div>
          
          {recentBookings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: "50%", 
                      background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icons.Users />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#F3F4F6" }}>
                        {booking.users?.full_name || "Traveler"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
                         <Icons.Clock /> {formatDate(booking.start_date)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#10B981" }}>${parseFloat(booking.total_price).toFixed(0)}</div>
                    <Badge
                        label={booking.status}
                        tone={
                          booking.status === "confirmed"
                            ? "success"
                            : booking.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              height: 200, display: "flex", flexDirection: "column", 
              alignItems: "center", justifyContent: "center", color: "#6B7280", gap: 12 
            }}>
              <Icons.Calendar />
              <p>No recent bookings</p>
            </div>
          )}
        </div>

        {/* Live Activity & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Recent Activity */}
           <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Icons.Activity /> Live Activity
            </h3>
             <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {activities.length > 0 ? (
            activities.map((activity, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "6px",
                  borderLeft: `3px solid ${
                    activity.type === "login"
                      ? "#10b981"
                      : activity.type === "signup"
                      ? "#3b82f6"
                      : activity.type === "booking"
                      ? "#8b5cf6"
                      : "#f59e0b"
                  }`,
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ marginRight: "12px" }}>{activity.message}</div>
                <div
                  className="muted"
                  style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                >
                  {formatTime(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
             <div style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>No recent activity</div>
          )}
        </div>
        </div>
        
        {/* Quick Actions */}
        <div className="card" style={{ background: "linear-gradient(180deg, #1F2937 0%, #111827 100%)" }}>
           <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button className="btn-secondary" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, height: "auto" }}>
                <div style={{ background: "#3B82F6", padding: 10, borderRadius: "50%", color: "white" }}>
                  <Icons.Chat />
                </div>
                Messages
              </button>
               <button className="btn-secondary" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, height: "auto" }}>
                <div style={{ background: "#10B981", padding: 10, borderRadius: "50%", color: "white" }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>
                Settings
              </button>
           </div>
        </div>  {/* End Quick Actions card */}
        </div>  {/* End Live Activity & Quick Actions container */}
      </div>  {/* End grid-2 */}
      
    </div>  {/* End main grid */}
  );  // Closing return statement
}  // Closing function

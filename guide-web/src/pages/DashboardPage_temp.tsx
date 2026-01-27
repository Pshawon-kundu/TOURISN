import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real guide data
  const [guideData, setGuideData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    fetchGuideData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchGuideData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Use database user ID (not auth ID)
      const userId = user.dbUserId || user.id;
      console.log("Dashboard: Fetching guide data for user_id:", userId);

      // Fetch guide profile
      const { data: guideProfile, error: guideError } = await supabase
        .from("guides")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (guideError) {
        console.error("Dashboard: Guide profile error:", guideError);
        throw guideError;
      }

      console.log("Dashboard: Guide found:", guideProfile.id);
      setGuideData(guideProfile);
      setIsOnline(
        guideProfile.is_available || guideProfile.status === "active" || false,
      );

      // Fetch bookings for this guide from the bookings table
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          users:user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `,
        )
        .eq("guide_id", guideProfile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (bookingsError) {
        console.error("Dashboard: Bookings error:", bookingsError);
        throw bookingsError;
      }

      console.log("Dashboard: Bookings found:", bookings?.length || 0);
      setRecentBookings(bookings || []);

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const activeBookings =
        bookings?.filter(
          (b) =>
            b.booking_status === "confirmed" || b.booking_status === "pending",
        ).length || 0;
      const pending =
        bookings?.filter((b) => b.booking_status === "pending").length || 0;
      const completedBookings =
        bookings?.filter((b) => b.payment_status === "completed") || [];
      const totalEarnings = completedBookings.reduce(
        (sum, b) => sum + (b.total_price || 0),
        0,
      );

      setStats({
        totalBookings,
        activeBookings,
        totalEarnings,
        averageRating: guideProfile.average_rating || 0,
      });
      setPendingRequests(pending);
    } catch (err) {
      console.error("Error fetching guide data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!user || !guideData) return;
    setLoadingStatus(true);
    try {
      const newStatus = !isOnline;
      const { error } = await supabase
        .from("guides")
        .update({ is_available: newStatus })
        .eq("id", guideData.id);

      if (error) throw error;
      setIsOnline(newStatus);
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setLoadingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const guideName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Guide";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="card relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          border: "none",
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold m-0 text-white">
                Welcome back, {guideName}!
              </h1>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                Pro Guide
              </span>
            </div>
            <p className="text-emerald-50 opacity-90 m-0 max-w-lg text-lg">
              You have{" "}
              <span className="font-bold">
                {pendingRequests} new{" "}
                {pendingRequests === 1 ? "request" : "requests"}
              </span>{" "}
              to check today.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-2 pr-6 rounded-full backdrop-blur-md border border-white/20">
            <button
              onClick={toggleStatus}
              disabled={loadingStatus}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
                ${isOnline ? "bg-white text-emerald-600" : "bg-red-500 text-white"}
              `}
            >
              <Icons.Power />
            </button>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                Current Status
              </span>
              <span className="font-bold text-lg flex items-center gap-2">
                {loadingStatus ? (
                  "Updating..."
                ) : isOnline ? (
                  <>
                    Online{" "}
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  </>
                ) : (
                  "Offline"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-6 text-sm font-medium opacity-90">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Icons.Activity />
            </div>
            <span>System Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Icons.Clock />
            </div>
            <span>Last updated: just now</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
        className="mb-8"
      >
        <StatCard
          label="Total Bookings"
          value={formatNumber(stats.totalBookings)}
          trend="+12% from last month"
          icon={<Icons.Calendar />}
        />
        <StatCard
          label="Active Trips"
          value={formatNumber(stats.activeBookings)}
          trend="Currently ongoing"
          icon={<Icons.Activity />}
        />
        <StatCard
          label="Total Earnings"
          value={`৳${formatNumber(stats.totalEarnings)}`}
          trend="+8% from last month"
          icon={<Icons.Wallet />}
        />
        <StatCard
          label="Rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
          trend="Based on 50 reviews"
          icon={<Icons.Star />}
        />
      </div>

      {/* Main Content Split */}
      <div
        className="grid grid-2 bg-transparent"
        style={{ gap: "1.5rem", alignItems: "start" }}
      >
        {/* Recent Bookings */}
        <div className="card shadow-sm border border-slate-100 h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                <Icons.Calendar />
              </div>
              <h3 className="text-lg font-bold text-slate-800 m-0">
                Recent Bookings
              </h3>
            </div>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="text-slate-400 mb-2 flex justify-center">
                  <Icons.Calendar />
                </div>
                <p className="text-slate-500 font-medium">No bookings yet</p>
                <p className="text-slate-400 text-sm">
                  New requests will appear here
                </p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-emerald-100 transition-all duration-200"
                >
                  <div className="flex items-start gap-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {
                        (booking.users?.first_name ||
                          booking.traveler_name ||
                          "G")[0]
                      }
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 m-0 group-hover:text-emerald-700 transition-colors">
                        {booking.users?.first_name
                          ? `${booking.users.first_name} ${booking.users.last_name || ""}`
                          : booking.traveler_name || "Guest User"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar />
                          {new Date(
                            booking.booking_date || booking.created_at,
                          ).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          {booking.from_location} → {booking.to_location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-right">
                      <div className="font-bold text-slate-800">
                        ৳{booking.total_amount?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    <Badge
                      label={booking.status}
                      tone={
                        booking.status === "confirmed"
                          ? "success"
                          : booking.status === "pending"
                            ? "warning"
                            : "default"
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Stats */}
        <div className="space-y-6">
          {/* Quick Stats / Info */}
          <div className="card shadow-sm border border-slate-100 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg m-0 text-white">
                Your Statistics
              </h3>
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
            <p className="text-indigo-100 mb-6">
              Real-time updates are active. Your profile is live. will receive
              new requests instantly.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-indigo-200 text-xs mb-1">
                  Response Rate
                </div>
                <div className="text-2xl font-bold">98%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-indigo-200 text-xs mb-1">Avg Response</div>
                <div className="text-2xl font-bold">5m</div>
              </div>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="card shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-0">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 text-purple-600 p-1.5 rounded-md">
                  <Icons.Users />
                </div>
                <h3 className="text-md font-bold text-slate-800 m-0">
                  Recent Customers
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-50 mt-4">
              {recentBookings.length === 0 ? (
                <p className="text-slate-500 py-4 text-center text-sm">
                  No recent bookings
                </p>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 py-3 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {
                          (booking.traveler_name ||
                            booking.users?.first_name ||
                            "G")[0]
                        }
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-sm truncate">
                        {booking.traveler_name ||
                          `${booking.users?.first_name} ${booking.users?.last_name || ""}`}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {booking.from_location} → {booking.to_location}
                      </p>
                    </div>
                    <button
                      className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all"
                      title="Send Message"
                    >
                      <Icons.Chat />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

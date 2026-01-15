import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { useRealtime } from "../context/RealtimeContext";

export function DashboardPage() {
  const { stats, recentBookings, recentGuides, activities, isConnected } =
    useRealtime();

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
    <div className="grid" style={{ gap: 22 }}>
      <div className="hero-gradient">
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>
          Welcome back, Admin 👋
        </h2>
        <p className="muted" style={{ margin: "8px 0 0", fontSize: "15px" }}>
          {currentDate} • Monitor performance, manage guides, and oversee
          bookings.
          <span
            style={{
              marginLeft: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isConnected ? "#10b981" : "#ef4444",
                animation: isConnected ? "pulse 2s infinite" : "none",
              }}
            />
            {isConnected ? "Live" : "Disconnected"}
          </span>
        </p>
      </div>

      <div className="grid grid-3">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers?.toLocaleString() || "Loading..."}
          trend={stats ? `${stats.pendingGuides} pending guides` : "..."}
        />
        <StatCard
          label="Active Guides"
          value={stats?.activeGuides?.toString() || "Loading..."}
          trend={stats ? `Total: ${stats.totalBookings} bookings` : "..."}
        />
        <StatCard
          label="Monthly Revenue"
          value={stats?.monthlyRevenue || "Loading..."}
          trend={
            stats?.lastUpdated
              ? `Updated ${formatTime(stats.lastUpdated)}`
              : "..."
          }
        />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Recent Bookings</h3>
          {recentBookings.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Traveler</th>
                  <th>Guide</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.users?.full_name || "N/A"}</td>
                    <td>{booking.guides?.full_name || "N/A"}</td>
                    <td>{formatDate(booking.start_date)}</td>
                    <td>${parseFloat(booking.total_price).toFixed(2)}</td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No recent bookings</p>
          )}
        </div>

        <div className="card">
          <h3>Recent Guides</h3>
          {recentGuides.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {recentGuides.slice(0, 5).map((guide) => (
                <div
                  key={guide.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{guide.full_name}</div>
                    <div className="muted" style={{ fontSize: "13px" }}>
                      {guide.users?.email}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge
                      label={guide.status}
                      tone={
                        guide.status === "approved"
                          ? "success"
                          : guide.status === "pending"
                          ? "warning"
                          : "danger"
                      }
                    />
                    <div
                      className="muted"
                      style={{ fontSize: "12px", marginTop: "4px" }}
                    >
                      ${guide.hourly_rate}/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No recent guides</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Live Activity Feed 🔴</h3>
        <div
          style={{
            maxHeight: "400px",
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
                      ? "#f59e0b"
                      : "#6366f1"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      {activity.message}
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: "12px" }}>
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

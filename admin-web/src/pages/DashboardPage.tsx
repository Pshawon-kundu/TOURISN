import { Badge } from "../components/Badge";
import { StatCard } from "../components/StatCard";
import { bookings, guides, stats } from "../data/mockData";

export function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid" style={{ gap: 22 }}>
      <div className="hero-gradient">
        <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>
          Welcome back, Admin 👋
        </h2>
        <p className="muted" style={{ margin: "8px 0 0", fontSize: "15px" }}>
          {currentDate} • Monitor performance, manage guides, and oversee
          bookings.
        </p>
      </div>

      <div className="grid grid-3">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="+3.4% MoM"
        />
        <StatCard
          label="Active Guides"
          value={stats.activeGuides.toString()}
          trend="+5 pending"
        />
        <StatCard
          label="Monthly Revenue"
          value={stats.monthlyRevenue}
          trend="+8.1%"
        />
      </div>

      <div className="card">
        <h3>Recent Bookings</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Traveler</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 4).map((b, idx) => (
              <tr key={idx}>
                <td>{b.trip}</td>
                <td>{b.traveler}</td>
                <td>{b.date}</td>
                <td>{b.amount}</td>
                <td>
                  <Badge
                    label={
                      b.status === "paid"
                        ? "Paid"
                        : b.status === "pending"
                        ? "Pending"
                        : "Cancelled"
                    }
                    tone={
                      b.status === "paid"
                        ? "success"
                        : b.status === "pending"
                        ? "warning"
                        : "danger"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Top Guides</h3>
        <div className="chip-row">
          {guides.map((g) => (
            <div
              key={g.name}
              className="badge success"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                color: "#93c5fd",
              }}
            >
              {g.name} · {g.rating.toFixed(1)} ★ · {g.trips} trips
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

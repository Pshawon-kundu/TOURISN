import { useEffect, useState } from "react";

interface Booking {
  id?: string;
  _id?: string;
  travelerName: string;
  email: string;
  phone: string;
  totalAmount: number;
  status: string;
  bookingDate: string;
  transportType?: string;
  from?: string;
  to?: string;
  propertyName?: string;
  propertyType?: string;
  location?: string;
}

interface BookingsData {
  mongodb: Booking[];
  firebase: Booking[];
  totalMongo: number;
  totalFirebase: number;
}

export function AllBookingsPage() {
  const [transportBookings, setTransportBookings] =
    useState<BookingsData | null>(null);
  const [stayBookings, setStayBookings] = useState<BookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transport" | "stays">(
    "transport"
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Fetch transport bookings
      const transportRes = await fetch("http://localhost:5000/api/transport");
      const transportData = await transportRes.json();

      // Fetch stay bookings
      const stayRes = await fetch("http://localhost:5000/api/stays");
      const stayData = await stayRes.json();

      if (transportData.success) {
        setTransportBookings(transportData.data);
      }

      if (stayData.success) {
        setStayBookings(stayData.data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBookingCard = (
    booking: Booking,
    source: "mongo" | "firebase"
  ) => {
    const isTransport = activeTab === "transport";
    const bookingId = booking.id || booking._id || "N/A";

    return (
      <div
        key={`${source}-${bookingId}`}
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {booking.travelerName}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 12,
                  backgroundColor: source === "mongo" ? "#3b82f6" : "#10b981",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {source === "mongo" ? "MongoDB" : "Firebase"}
              </span>
            </div>
            <p style={{ margin: "4px 0", color: "#6b7280", fontSize: 14 }}>
              ID: {bookingId}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#059669",
              }}
            >
              ৳ {booking.totalAmount}
            </span>
            <span
              style={{
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 12,
                backgroundColor:
                  booking.status === "confirmed" ? "#d1fae5" : "#fee2e2",
                color: booking.status === "confirmed" ? "#065f46" : "#991b1b",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "#6b7280" }}>📧</span>
            <span>{booking.email}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "#6b7280" }}>📱</span>
            <span>{booking.phone}</span>
          </div>

          {isTransport && booking.transportType && (
            <>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ color: "#6b7280" }}>🚗</span>
                <span style={{ textTransform: "capitalize" }}>
                  {booking.transportType}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ color: "#6b7280" }}>📍</span>
                <span>
                  {booking.from} → {booking.to}
                </span>
              </div>
            </>
          )}

          {!isTransport && booking.propertyName && (
            <>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ color: "#6b7280" }}>🏨</span>
                <span>{booking.propertyName}</span>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <span style={{ color: "#6b7280" }}>📍</span>
                <span>{booking.location}</span>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "#6b7280" }}>📅</span>
            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
            animation: "spin 1s linear infinite",
          }}
        >
          ⏳
        </div>
        <p style={{ color: "#6b7280" }}>Loading bookings...</p>
      </div>
    );
  }

  const currentBookings =
    activeTab === "transport" ? transportBookings : stayBookings;

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          All Bookings
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16 }}>
          View all transport and accommodation bookings
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <button
          onClick={() => setActiveTab("transport")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "transport" ? "#007AFF" : "#6b7280",
            borderBottom:
              activeTab === "transport" ? "3px solid #007AFF" : "none",
            marginBottom: -2,
          }}
        >
          🚗 Transport ({transportBookings?.totalMongo || 0})
        </button>
        <button
          onClick={() => setActiveTab("stays")}
          style={{
            padding: "12px 24px",
            border: "none",
            background: "none",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "stays" ? "#007AFF" : "#6b7280",
            borderBottom: activeTab === "stays" ? "3px solid #007AFF" : "none",
            marginBottom: -2,
          }}
        >
          🏨 Stays ({stayBookings?.totalMongo || 0})
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "#eff6ff",
            borderRadius: 12,
            border: "2px solid #3b82f6",
          }}
        >
          <div style={{ fontSize: 14, color: "#1e40af", marginBottom: 4 }}>
            MongoDB Database
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#1e3a8a" }}>
            {currentBookings?.totalMongo || 0}
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Total bookings</div>
        </div>
        <div
          style={{
            padding: 20,
            backgroundColor: "#d1fae5",
            borderRadius: 12,
            border: "2px solid #10b981",
          }}
        >
          <div style={{ fontSize: 14, color: "#065f46", marginBottom: 4 }}>
            Firebase Database
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#064e3b" }}>
            {currentBookings?.totalFirebase || 0}
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Total bookings</div>
        </div>
      </div>

      {/* Bookings Lists */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* MongoDB Bookings */}
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              color: "#1e3a8a",
            }}
          >
            📦 MongoDB Bookings
          </h2>
          {currentBookings?.mongodb && currentBookings.mongodb.length > 0 ? (
            currentBookings.mongodb.map((booking) =>
              renderBookingCard(booking, "mongo")
            )
          ) : (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                backgroundColor: "#f9fafb",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#6b7280" }}>No bookings yet</p>
            </div>
          )}
        </div>

        {/* Firebase Bookings */}
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              color: "#065f46",
            }}
          >
            🔥 Firebase Bookings
          </h2>
          {currentBookings?.firebase && currentBookings.firebase.length > 0 ? (
            currentBookings.firebase.map((booking) =>
              renderBookingCard(booking, "firebase")
            )
          ) : (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                backgroundColor: "#f9fafb",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#6b7280" }}>No bookings yet</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={fetchBookings}
        style={{
          marginTop: 24,
          padding: "12px 24px",
          backgroundColor: "#007AFF",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        🔄 Refresh Bookings
      </button>
    </div>
  );
}

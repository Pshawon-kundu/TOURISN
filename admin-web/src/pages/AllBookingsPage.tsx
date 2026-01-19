import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { supabase } from "../config/supabase";

interface Booking {
  id: string;
  user_id: string;
  guide_id?: string;
  booking_type?: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  traveler_name?: string;
  phone?: string;
  email?: string;
  transport_type?: string;
  from_location?: string;
  to_location?: string;
  property_name?: string;
  property_type?: string;
  location?: string;
  check_in_date?: string;
  check_out_date?: string;
  travel_date?: string;
}

export function AllBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "transport" | "stays" | "guide"
  >("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterType === "all") return true;
    if (filterType === "transport") return booking.booking_type === "transport";
    if (filterType === "stays") return booking.booking_type === "stays";
    if (filterType === "guide") return booking.guide_id;
    return true;
  });

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    status: string,
  ) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: status })
        .eq("id", bookingId);

      if (error) throw error;
      alert(`Payment status updated to ${status}`);
      fetchBookings();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3>All Bookings ({filteredBookings.length})</h3>
            <p className="muted">View and manage all bookings from Supabase</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${filterType === "all" ? "btn-primary" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All ({bookings.length})
            </button>
            <button
              className={`btn ${filterType === "transport" ? "btn-primary" : ""}`}
              onClick={() => setFilterType("transport")}
            >
              Transport (
              {bookings.filter((b) => b.booking_type === "transport").length})
            </button>
            <button
              className={`btn ${filterType === "stays" ? "btn-primary" : ""}`}
              onClick={() => setFilterType("stays")}
            >
              Stays ({bookings.filter((b) => b.booking_type === "stays").length}
              )
            </button>
            <button
              className={`btn ${filterType === "guide" ? "btn-primary" : ""}`}
              onClick={() => setFilterType("guide")}
            >
              Guide ({bookings.filter((b) => b.guide_id).length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p className="muted">No bookings found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="card"
              style={{
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => {
                setSelectedBooking(booking);
                setShowDetailsModal(true);
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <h4 style={{ margin: 0 }}>
                      {booking.traveler_name || "Unknown Traveler"}
                    </h4>
                    <Badge
                      label={booking.booking_type || "unknown"}
                      tone="neutral"
                    />
                    <Badge
                      label={booking.payment_status || "pending"}
                      tone={
                        booking.payment_status === "paid"
                          ? "success"
                          : booking.payment_status === "refunded"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 12,
                      color: "#666",
                    }}
                  >
                    <div>
                      <strong>Amount:</strong> ৳{booking.total_amount}
                    </div>
                    <div>
                      <strong>Date:</strong>{" "}
                      {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                    {booking.email && (
                      <div>
                        <strong>Email:</strong> {booking.email}
                      </div>
                    )}
                    {booking.phone && (
                      <div>
                        <strong>Phone:</strong> {booking.phone}
                      </div>
                    )}
                    {booking.transport_type && (
                      <div>
                        <strong>Transport:</strong> {booking.transport_type}
                      </div>
                    )}
                    {booking.from_location && booking.to_location && (
                      <div>
                        <strong>Route:</strong> {booking.from_location} →{" "}
                        {booking.to_location}
                      </div>
                    )}
                    {booking.property_name && (
                      <div>
                        <strong>Property:</strong> {booking.property_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: 700,
              maxHeight: "90vh",
              overflow: "auto",
              margin: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3>Booking Details</h3>
              <button
                className="btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h4>Traveler Information</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Name:</strong>{" "}
                    {selectedBooking.traveler_name || "N/A"}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Email:</strong> {selectedBooking.email || "N/A"}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Phone:</strong> {selectedBooking.phone || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h4>Booking Information</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Type:</strong>{" "}
                    {selectedBooking.booking_type || "N/A"}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Total Amount:</strong> ৳
                    {selectedBooking.total_amount}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Payment Status:</strong>{" "}
                    {selectedBooking.payment_status}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Booking Date:</strong>{" "}
                    {new Date(selectedBooking.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedBooking.booking_type === "transport" && (
                <div>
                  <h4>Transport Details</h4>
                  <div style={{ display: "grid", gap: 8 }}>
                    {selectedBooking.transport_type && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Type:</strong> {selectedBooking.transport_type}
                      </p>
                    )}
                    {selectedBooking.from_location && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>From:</strong> {selectedBooking.from_location}
                      </p>
                    )}
                    {selectedBooking.to_location && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>To:</strong> {selectedBooking.to_location}
                      </p>
                    )}
                    {selectedBooking.travel_date && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Travel Date:</strong>{" "}
                        {selectedBooking.travel_date}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.booking_type === "stays" && (
                <div>
                  <h4>Stay Details</h4>
                  <div style={{ display: "grid", gap: 8 }}>
                    {selectedBooking.property_name && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Property:</strong>{" "}
                        {selectedBooking.property_name}
                      </p>
                    )}
                    {selectedBooking.property_type && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Type:</strong> {selectedBooking.property_type}
                      </p>
                    )}
                    {selectedBooking.location && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Location:</strong> {selectedBooking.location}
                      </p>
                    )}
                    {selectedBooking.check_in_date && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Check-in:</strong>{" "}
                        {selectedBooking.check_in_date}
                      </p>
                    )}
                    {selectedBooking.check_out_date && (
                      <p style={{ color: "#212529", margin: 0 }}>
                        <strong>Check-out:</strong>{" "}
                        {selectedBooking.check_out_date}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4>System Information</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>Booking ID:</strong> {selectedBooking.id}
                  </p>
                  <p style={{ color: "#212529", margin: 0 }}>
                    <strong>User ID:</strong> {selectedBooking.user_id}
                  </p>
                  {selectedBooking.guide_id && (
                    <p style={{ color: "#212529", margin: 0 }}>
                      <strong>Guide ID:</strong> {selectedBooking.guide_id}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                {selectedBooking.payment_status === "pending" && (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      handleUpdatePaymentStatus(selectedBooking.id, "paid")
                    }
                  >
                    Mark as Paid
                  </button>
                )}
                {selectedBooking.payment_status === "paid" && (
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleUpdatePaymentStatus(selectedBooking.id, "refunded")
                    }
                  >
                    Issue Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

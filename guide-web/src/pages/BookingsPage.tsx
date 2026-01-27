import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

interface Booking {
  id: string;
  user_id: string;
  booking_type?: string;
  trip_name?: string;
  location?: string;
  check_in_date?: string;
  check_out_date?: string;
  guests?: number;
  item_name?: string;
  total_price: number;
  payment_status: string;
  booking_status: string;
  payment_method: string;
  created_at: string;
  guide_name?: string;
  guide_rate?: number;
  guide_hours?: number;
}

export function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      // Use the database user ID (not auth ID)
      const userId = user.dbUserId || user.id;
      console.log("Fetching guide with user_id:", userId);

      // First get guide ID
      const { data: guideData, error: guideError } = await supabase
        .from("guides")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (guideError || !guideData) {
        console.error("No guide profile found for user:", userId, guideError);
        setLoading(false);
        return;
      }

      console.log("Guide found:", guideData.id);

      // Fetch bookings for this guide from the bookings table
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("guide_id", guideData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Bookings found:", data?.length || 0);
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Bookings ({bookings.length})</h3>
        <p className="muted">Review and manage all customer bookings</p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p className="muted">No bookings found</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "trip_name",
              label: "Trip/Experience",
              render: (booking: Booking) =>
                booking.trip_name || booking.item_name || "N/A",
            },
            {
              key: "location",
              label: "Location",
              render: (booking: Booking) => booking.location || "N/A",
            },
            {
              key: "check_in_date",
              label: "Date",
              render: (booking: Booking) =>
                booking.check_in_date
                  ? new Date(booking.check_in_date).toLocaleDateString()
                  : new Date(booking.created_at).toLocaleDateString(),
            },
            {
              key: "guests",
              label: "Guests",
              render: (booking: Booking) => booking.guests || 1,
            },
            {
              key: "total_price",
              label: "Amount",
              render: (booking: Booking) => `৳${booking.total_price || 0}`,
            },
            {
              key: "booking_status",
              label: "Status",
              render: (booking: Booking) => (
                <Badge
                  label={booking.booking_status || "pending"}
                  tone={
                    booking.booking_status === "confirmed"
                      ? "success"
                      : booking.booking_status === "cancelled"
                        ? "danger"
                        : "warning"
                  }
                />
              ),
            },
            {
              key: "payment_status",
              label: "Payment",
              render: (booking: Booking) => (
                <Badge
                  label={booking.payment_status || "pending"}
                  tone={
                    booking.payment_status === "completed"
                      ? "success"
                      : booking.payment_status === "refunded"
                        ? "danger"
                        : "warning"
                  }
                />
              ),
            },
          ]}
          data={bookings}
          searchableKeys={["trip_name", "location", "booking_status"]}
          renderActions={(booking: Booking) => (
            <div className="table-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowDetailsModal(true);
                }}
              >
                View
              </button>
              {booking.payment_status === "pending" && (
                <button
                  className="btn"
                  onClick={() =>
                    handleUpdatePaymentStatus(booking.id, "completed")
                  }
                >
                  Mark Paid
                </button>
              )}
              {booking.payment_status === "completed" && (
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleUpdatePaymentStatus(booking.id, "refunded")
                  }
                >
                  Refund
                </button>
              )}
            </div>
          )}
        />
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
              maxWidth: 600,
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h4>Trip Information</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Trip Name:</strong>{" "}
                  {selectedBooking.trip_name ||
                    selectedBooking.item_name ||
                    "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Location:</strong> {selectedBooking.location || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Type:</strong> {selectedBooking.booking_type || "N/A"}
                </p>
              </div>

              <div>
                <h4>Booking Details</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Check-in:</strong>{" "}
                  {selectedBooking.check_in_date
                    ? new Date(
                        selectedBooking.check_in_date,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Check-out:</strong>{" "}
                  {selectedBooking.check_out_date
                    ? new Date(
                        selectedBooking.check_out_date,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Guests:</strong> {selectedBooking.guests || 1}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Total Price:</strong> ৳{selectedBooking.total_price}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Booking Status:</strong>{" "}
                  {selectedBooking.booking_status}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Payment Status:</strong>{" "}
                  {selectedBooking.payment_status}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Payment Method:</strong>{" "}
                  {selectedBooking.payment_method}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Booking Date:</strong>{" "}
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </p>
              </div>

              {selectedBooking.guide_name && (
                <div>
                  <h4>Guide Assignment</h4>
                  <p style={{ color: "#212529" }}>
                    <strong>Guide:</strong> {selectedBooking.guide_name}
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>Rate:</strong> ৳{selectedBooking.guide_rate}/hour
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>Hours:</strong> {selectedBooking.guide_hours}
                  </p>
                </div>
              )}

              <div>
                <h4>IDs</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Booking ID:</strong> {selectedBooking.id}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>User ID:</strong> {selectedBooking.user_id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { supabase } from "../config/supabase";

interface Booking {
  id: string;
  user_id: string;
  transport_type?: string;
  from_location?: string;
  to_location?: string;
  traveler_name: string;
  phone: string;
  email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  notes?: string;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("transport_bookings")
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

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    status: string,
  ) => {
    try {
      const { error } = await supabase
        .from("transport_bookings")
        .update({ status: status })
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
              key: "traveler_name",
              label: "Traveler",
              render: (booking: Booking) => booking.traveler_name || "N/A",
            },
            {
              key: "transport_type",
              label: "Type",
              render: (booking: Booking) => booking.transport_type || "N/A",
            },
            {
              key: "total_amount",
              label: "Amount",
              render: (booking: Booking) => `৳${booking.total_amount || 0}`,
            },
            {
              key: "created_at",
              label: "Date",
              render: (booking: Booking) =>
                new Date(booking.created_at).toLocaleDateString(),
            },
            {
              key: "status",
              label: "Payment",
              render: (booking: Booking) => (
                <Badge
                  label={booking.status || "pending"}
                  tone={
                    booking.status === "paid"
                      ? "success"
                      : booking.status === "refunded"
                        ? "danger"
                        : "warning"
                  }
                />
              ),
            },
          ]}
          data={bookings}
          searchableKeys={["traveler_name", "transport_type", "status"]}
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
              {booking.status === "pending" && (
                <button
                  className="btn"
                  onClick={() => handleUpdatePaymentStatus(booking.id, "paid")}
                >
                  Mark Paid
                </button>
              )}
              {booking.status === "paid" && (
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
                <h4>Traveler Information</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Name:</strong>{" "}
                  {selectedBooking.traveler_name || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Email:</strong> {selectedBooking.email || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Phone:</strong> {selectedBooking.phone || "N/A"}
                </p>
              </div>

              <div>
                <h4>Booking Information</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Type:</strong>{" "}
                  {selectedBooking.transport_type || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>From:</strong>{" "}
                  {selectedBooking.from_location || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>To:</strong> {selectedBooking.to_location || "N/A"}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Total Amount:</strong> ৳{selectedBooking.total_amount}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>Payment Status:</strong> {selectedBooking.status}
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

              <div>
                <h4>IDs</h4>
                <p style={{ color: "#212529" }}>
                  <strong>Booking ID:</strong> {selectedBooking.id}
                </p>
                <p style={{ color: "#212529" }}>
                  <strong>User ID:</strong> {selectedBooking.user_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

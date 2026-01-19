import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { supabase } from "../config/supabase";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  nid_number?: string;
  nid_image_url?: string;
  nid_verified: boolean;
  status: "active" | "suspended" | "pending";
  phone?: string;
  created_at: string;
  updated_at?: string;
}

interface Booking {
  id: string;
  user_id: string;
  guide_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showNIDModal, setShowNIDModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "suspended" | "pending"
  >("all");

  useEffect(() => {
    fetchUsers();
    fetchBookings();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleVerifyNID = async (userId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          nid_verified: verified,
          nid_verification_date: verified ? new Date().toISOString() : null,
        })
        .eq("id", userId);

      if (error) throw error;

      alert(
        verified ? "NID Verified Successfully!" : "NID Marked as Unverified",
      );
      fetchUsers();
      setShowNIDModal(false);
    } catch (error) {
      console.error("Error verifying NID:", error);
      alert("Failed to update verification status");
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      alert("User approved successfully!");
      fetchUsers();
      setShowUserDetailsModal(false);
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "suspended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      alert("User suspended successfully!");
      fetchUsers();
      setShowUserDetailsModal(false);
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      alert("User activated successfully!");
      fetchUsers();
      setShowUserDetailsModal(false);
    } catch (error) {
      console.error("Error activating user:", error);
      alert("Failed to activate user");
    }
  };

  const openUserDetailsModal = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const getUserBookingCount = (userId: string) => {
    return bookings.filter((b) => b.user_id === userId).length;
  };

  const openNIDModal = (user: User) => {
    setSelectedUser(user);
    setShowNIDModal(true);
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <h3>Loading users...</h3>
      </div>
    );
  }

  const filteredUsers =
    filterStatus === "all"
      ? users
      : users.filter((u) => u.status === filterStatus);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2>Users Management</h2>
        <p className="muted">
          Total Users: {users.length} | Active:{" "}
          {users.filter((u) => u.status === "active").length} | Suspended:{" "}
          {users.filter((u) => u.status === "suspended").length} | Pending:{" "}
          {users.filter((u) => u.status === "pending").length} | Verified NIDs:{" "}
          {users.filter((u) => u.nid_verified).length}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className={`btn ${filterStatus === "all" ? "btn-primary" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Users
          </button>
          <button
            className={`btn ${filterStatus === "active" ? "btn-success" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </button>
          <button
            className={`btn ${filterStatus === "pending" ? "btn-warning" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`btn ${filterStatus === "suspended" ? "btn-danger" : ""}`}
            onClick={() => setFilterStatus("suspended")}
          >
            Suspended
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "first_name",
            label: "Name",
            render: (row: User) =>
              `${row.first_name || ""} ${row.last_name || ""}`.trim(),
          },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (row: User) => (
              <Badge
                label={row.role}
                tone={row.role === "admin" ? "success" : "neutral"}
              />
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row: User) => (
              <Badge
                label={row.status || "active"}
                tone={
                  row.status === "active"
                    ? "success"
                    : row.status === "pending"
                      ? "warning"
                      : "danger"
                }
              />
            ),
          },
          {
            key: "nid_number",
            label: "NID",
            render: (row: User) => (
              <span>{row.nid_number || "Not provided"}</span>
            ),
          },
          {
            key: "nid_verified",
            label: "NID Status",
            render: (row: User) => (
              <Badge
                label={row.nid_verified ? "Verified" : "Pending"}
                tone={row.nid_verified ? "success" : "warning"}
              />
            ),
          },
          {
            key: "id",
            label: "Bookings",
            render: (row: User) => (
              <span style={{ fontWeight: "bold" }}>
                {getUserBookingCount(row.id)}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Joined",
            render: (row: User) => (
              <span>{new Date(row.created_at).toLocaleDateString()}</span>
            ),
          },
        ]}
        data={filteredUsers}
        searchableKeys={[
          "first_name",
          "last_name",
          "email",
          "role",
          "status",
          "nid_number",
        ]}
        renderActions={(row: User) => (
          <div className="table-actions">
            <button
              className="btn btn-primary"
              onClick={() => openUserDetailsModal(row)}
            >
              View Details
            </button>
            {row.nid_image_url && (
              <button className="btn" onClick={() => openNIDModal(row)}>
                View NID
              </button>
            )}
            {row.status === "pending" && (
              <button
                className="btn btn-success"
                onClick={() => handleApproveUser(row.id)}
              >
                Approve
              </button>
            )}
            {row.status === "active" && (
              <button
                className="btn btn-danger"
                onClick={() => handleSuspendUser(row.id)}
              >
                Suspend
              </button>
            )}
            {row.status === "suspended" && (
              <button
                className="btn btn-success"
                onClick={() => handleActivateUser(row.id)}
              >
                Activate
              </button>
            )}
          </div>
        )}
      />

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowUserDetailsModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 700,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                borderBottom: "2px solid #eee",
                paddingBottom: 12,
              }}
            >
              <h2>User Details</h2>
              <button
                className="btn"
                onClick={() => setShowUserDetailsModal(false)}
                style={{ padding: "4px 12px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {/* Personal Information */}
              <div>
                <h3 style={{ marginBottom: 12, fontSize: 18 }}>
                  Personal Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    backgroundColor: "#f8f9fa",
                    padding: 16,
                    borderRadius: 8,
                    color: "#212529",
                  }}
                >
                  <p style={{ color: "#212529" }}>
                    <strong>Full Name:</strong> {selectedUser.first_name}{" "}
                    {selectedUser.last_name}
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  {selectedUser.phone && (
                    <p style={{ color: "#212529" }}>
                      <strong>Phone:</strong> {selectedUser.phone}
                    </p>
                  )}
                  <p style={{ color: "#212529" }}>
                    <strong>Role:</strong>{" "}
                    <Badge
                      label={selectedUser.role}
                      tone={
                        selectedUser.role === "admin" ? "success" : "neutral"
                      }
                    />
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>Status:</strong>{" "}
                    <Badge
                      label={selectedUser.status || "active"}
                      tone={
                        selectedUser.status === "active"
                          ? "success"
                          : selectedUser.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    />
                  </p>
                </div>
              </div>

              {/* NID Information */}
              <div>
                <h3 style={{ marginBottom: 12, fontSize: 18 }}>
                  NID Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    backgroundColor: "#f8f9fa",
                    padding: 16,
                    borderRadius: 8,
                    color: "#212529",
                  }}
                >
                  <p style={{ color: "#212529" }}>
                    <strong>NID Number:</strong>{" "}
                    {selectedUser.nid_number || "Not provided"}
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>NID Status:</strong>{" "}
                    <Badge
                      label={
                        selectedUser.nid_verified
                          ? "Verified ✓"
                          : "Not Verified"
                      }
                      tone={selectedUser.nid_verified ? "success" : "warning"}
                    />
                  </p>
                  {selectedUser.nid_image_url && (
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => openNIDModal(selectedUser)}
                        style={{ marginTop: 8 }}
                      >
                        View NID Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h3 style={{ marginBottom: 12, fontSize: 18 }}>
                  Account Activity
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    backgroundColor: "#f8f9fa",
                    padding: 16,
                    borderRadius: 8,
                    color: "#212529",
                  }}
                >
                  <p style={{ color: "#212529" }}>
                    <strong>Total Bookings:</strong>{" "}
                    {getUserBookingCount(selectedUser.id)}
                  </p>
                  <p style={{ color: "#212529" }}>
                    <strong>Joined:</strong>{" "}
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                  {selectedUser.updated_at && (
                    <p style={{ color: "#212529" }}>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(selectedUser.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 24,
                borderTop: "2px solid #eee",
                paddingTop: 16,
              }}
            >
              {selectedUser.status === "pending" && (
                <button
                  className="btn btn-success"
                  onClick={() => handleApproveUser(selectedUser.id)}
                  style={{ flex: 1 }}
                >
                  ✓ Approve User
                </button>
              )}
              {selectedUser.status === "active" && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleSuspendUser(selectedUser.id)}
                  style={{ flex: 1 }}
                >
                  🚫 Suspend User
                </button>
              )}
              {selectedUser.status === "suspended" && (
                <button
                  className="btn btn-success"
                  onClick={() => handleActivateUser(selectedUser.id)}
                  style={{ flex: 1 }}
                >
                  ✓ Activate User
                </button>
              )}
              {selectedUser.nid_number && !selectedUser.nid_verified && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleVerifyNID(selectedUser.id, true);
                    setShowUserDetailsModal(false);
                  }}
                  style={{ flex: 1 }}
                >
                  ✓ Verify NID
                </button>
              )}
              <button
                className="btn"
                onClick={() => setShowUserDetailsModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NID Verification Modal */}
      {showNIDModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowNIDModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3>NID Verification</h3>
              <button
                className="btn"
                onClick={() => setShowNIDModal(false)}
                style={{ padding: "4px 12px" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p>
                <strong>Name:</strong> {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>NID Number:</strong> {selectedUser.nid_number}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  label={selectedUser.nid_verified ? "Verified" : "Pending"}
                  tone={selectedUser.nid_verified ? "success" : "warning"}
                />
              </p>
            </div>

            {selectedUser.nid_image_url && (
              <div style={{ marginBottom: 20 }}>
                <h4>NID Card Image</h4>
                <img
                  src={selectedUser.nid_image_url}
                  alt="NID Card"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              {!selectedUser.nid_verified && (
                <button
                  className="btn btn-success"
                  onClick={() => handleVerifyNID(selectedUser.id, true)}
                  style={{ flex: 1 }}
                >
                  ✓ Approve NID
                </button>
              )}
              {selectedUser.nid_verified && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleVerifyNID(selectedUser.id, false)}
                  style={{ flex: 1 }}
                >
                  ✗ Reject NID
                </button>
              )}
              <button
                className="btn"
                onClick={() => setShowNIDModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

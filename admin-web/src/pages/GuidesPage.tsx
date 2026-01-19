import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { supabase } from "../config/supabase";

interface Guide {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  years_of_experience?: number;
  certifications?: string[];
  nid_number?: string;
  nid_image_url?: string;
  age?: number;
  expertise_area?: string;
  per_hour_rate?: number;
  expertise_categories?: string[];
  coverage_areas?: string[];
  is_verified: boolean;
  status: "active" | "pending" | "suspended";
  rating?: number;
  total_reviews?: number;
  is_available: boolean;
  location?: string;
  profile_image_url?: string;
  created_at: string;
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGuide = async (guideId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("guides")
        .update({ is_verified: verified })
        .eq("id", guideId);

      if (error) throw error;
      alert(verified ? "Guide Verified!" : "Guide Unverified");
      fetchGuides();
    } catch (error) {
      console.error("Error verifying guide:", error);
      alert("Failed to update verification");
    }
  };

  const handleUpdateStatus = async (guideId: string, status: string) => {
    if (
      status === "suspended" &&
      !window.confirm(
        "Are you sure you want to suspend this guide? They will verify again to become active.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("guides")
        .update({ status })
        .eq("id", guideId);

      if (error) throw error;
      alert(`Guide status updated to ${status}`);
      fetchGuides();
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Guides ({guides.length})</h3>
        <p className="muted">Manage guide registrations and profiles</p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          Loading guides...
        </div>
      ) : guides.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p className="muted">No guides registered yet</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "first_name",
              label: "Name",
              render: (guide: Guide) =>
                `${guide.first_name || ""} ${guide.last_name || ""}`.trim() ||
                guide.email,
            },
            {
              key: "email",
              label: "Email",
              render: (guide: Guide) => guide.email || "N/A",
            },
            {
              key: "phone",
              label: "Phone",
              render: (guide: Guide) => guide.phone || "N/A",
            },
            {
              key: "location",
              label: "Location",
              render: (guide: Guide) =>
                guide.location || guide.expertise_area || "N/A",
            },
            {
              key: "rating",
              label: "Rating",
              render: (guide: Guide) =>
                `${guide.rating || 0} ⭐ (${guide.total_reviews || 0})`,
            },
            {
              key: "is_verified",
              label: "Verified",
              render: (guide: Guide) => (
                <Badge
                  label={guide.is_verified ? "Verified" : "Unverified"}
                  tone={guide.is_verified ? "success" : "warning"}
                />
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (guide: Guide) => (
                <Badge
                  label={guide.status}
                  tone={
                    guide.status === "active"
                      ? "success"
                      : guide.status === "pending"
                        ? "warning"
                        : "danger"
                  }
                />
              ),
            },
          ]}
          data={guides}
          searchableKeys={[
            "first_name",
            "last_name",
            "email",
            "phone",
            "location",
            "status",
          ]}
          renderActions={(guide: Guide) => (
            <div className="table-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedGuide(guide);
                  setShowDetailsModal(true);
                }}
              >
                View
              </button>
              {!guide.is_verified && (
                <button
                  className="btn"
                  onClick={() => handleVerifyGuide(guide.id, true)}
                >
                  Verify
                </button>
              )}
              {guide.status === "pending" && (
                <button
                  className="btn"
                  onClick={() => handleUpdateStatus(guide.id, "active")}
                >
                  Approve
                </button>
              )}
              {guide.status !== "suspended" && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleUpdateStatus(guide.id, "suspended")}
                >
                  Suspend
                </button>
              )}
            </div>
          )}
        />
      )}

      {/* Guide Details Modal */}
      {showDetailsModal && selectedGuide && (
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
              <h3>Guide Details</h3>
              <button
                className="btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h4>Personal Information</h4>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Name:</strong>{" "}
                  {`${selectedGuide.first_name || ""} ${selectedGuide.last_name || ""}`.trim() ||
                    "N/A"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Email:</strong> {selectedGuide.email || "N/A"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Phone:</strong> {selectedGuide.phone || "N/A"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Age:</strong> {selectedGuide.age || "N/A"}
                </p>
              </div>

              <div>
                <h4>Guide Information</h4>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Expertise Area:</strong>{" "}
                  {selectedGuide.expertise_area || "N/A"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Per Hour Rate:</strong> ৳
                  {selectedGuide.per_hour_rate || 0}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Experience:</strong>{" "}
                  {selectedGuide.years_of_experience || 0} years
                </p>
              </div>

              {selectedGuide.expertise_categories &&
                selectedGuide.expertise_categories.length > 0 && (
                  <div>
                    <h4>Expertise Categories</h4>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {selectedGuide.expertise_categories.join(", ")}
                    </p>
                  </div>
                )}

              {selectedGuide.coverage_areas &&
                selectedGuide.coverage_areas.length > 0 && (
                  <div>
                    <h4>Coverage Areas</h4>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {selectedGuide.coverage_areas.join(", ")}
                    </p>
                  </div>
                )}

              <div>
                <h4>NID Information</h4>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>NID Number:</strong>{" "}
                  {selectedGuide.nid_number || "N/A"}
                </p>
                {selectedGuide.nid_image_url && (
                  <img
                    src={selectedGuide.nid_image_url}
                    alt="NID"
                    style={{
                      maxWidth: "100%",
                      marginTop: 10,
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>

              {selectedGuide.bio && (
                <div>
                  <h4>Bio</h4>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {selectedGuide.bio}
                  </p>
                </div>
              )}

              <div>
                <h4>Account Status</h4>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Status:</strong> {selectedGuide.status}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Verified:</strong>{" "}
                  {selectedGuide.is_verified ? "Yes" : "No"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Available:</strong>{" "}
                  {selectedGuide.is_available ? "Yes" : "No"}
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Rating:</strong> {selectedGuide.rating || 0} ⭐
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  <strong>Total Reviews:</strong>{" "}
                  {selectedGuide.total_reviews || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

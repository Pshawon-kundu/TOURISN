import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";

interface GuideProfile {
  id: string;
  user_id: string;
  nid_number: string;
  specializations: string[];
  languages: string[];
  hourly_rate: number;
  experience_years: number;
  bio: string;
  location: string;
  total_bookings: number;
  total_earnings: number;
  average_rating: number;
  verification_status: string;
  is_available: boolean;
  created_at: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    hourly_rate: 0,
    specializations: "",
    languages: "",
    is_available: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        bio: data.bio || "",
        hourly_rate: data.hourly_rate || 0,
        specializations: (data.specializations || []).join(", "),
        languages: (data.languages || []).join(", "),
        is_available: data.is_available ?? true,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("guides")
        .update({
          bio: formData.bio,
          hourly_rate: formData.hourly_rate,
          specializations: formData.specializations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          languages: formData.languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          is_available: formData.is_available,
        })
        .eq("id", profile.id);

      if (error) throw error;

      alert("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <h3>Profile Not Found</h3>
        <p className="muted">No guide profile associated with this account.</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Bookings",
      value: profile.total_bookings || 0,
      icon: "📅",
    },
    {
      label: "Total Earnings",
      value: `৳${(profile.total_earnings || 0).toLocaleString()}`,
      icon: "💰",
    },
    {
      label: "Average Rating",
      value: (profile.average_rating || 0).toFixed(1),
      icon: "⭐",
    },
    {
      label: "Experience",
      value: `${profile.experience_years || 0} years`,
      icon: "🎓",
    },
  ];

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Header */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>My Profile</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Manage your guide profile and settings
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {editing ? (
              <>
                <button className="btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Save Changes
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ textAlign: "center", padding: "24px" }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Details */}
      <div className="card">
        <h3>Profile Information</h3>

        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {/* Basic Info */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Full Name
              </label>
              <input
                className="input"
                value={`${user?.first_name || ""} ${user?.last_name || ""}`}
                disabled
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Email
              </label>
              <input className="input" value={user?.email || ""} disabled />
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Phone
              </label>
              <input className="input" value={user?.phone || ""} disabled />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                NID Number
              </label>
              <input
                className="input"
                value={profile.nid_number || ""}
                disabled
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>Bio</label>
            <textarea
              className="input"
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={!editing}
              placeholder="Tell travelers about yourself..."
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Hourly Rate (৳)
              </label>
              <input
                className="input"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourly_rate: Number(e.target.value),
                  })
                }
                disabled={!editing}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Location
              </label>
              <input
                className="input"
                value={profile.location || "Not set"}
                disabled
              />
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Specializations (comma separated)
              </label>
              <input
                className="input"
                value={formData.specializations}
                onChange={(e) =>
                  setFormData({ ...formData, specializations: e.target.value })
                }
                disabled={!editing}
                placeholder="e.g., Historical Sites, Food Tours, Adventure"
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--muted)" }}>
                Languages (comma separated)
              </label>
              <input
                className="input"
                value={formData.languages}
                onChange={(e) =>
                  setFormData({ ...formData, languages: e.target.value })
                }
                disabled={!editing}
                placeholder="e.g., Bengali, English, Hindi"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="availability"
              checked={formData.is_available}
              onChange={(e) =>
                setFormData({ ...formData, is_available: e.target.checked })
              }
              disabled={!editing}
              style={{ width: 20, height: 20 }}
            />
            <label
              htmlFor="availability"
              style={{ cursor: editing ? "pointer" : "default" }}
            >
              Available for bookings
            </label>
          </div>

          {/* Status Badge */}
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>
              Verification Status
            </label>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor:
                    profile.verification_status === "approved"
                      ? "var(--success-bg)"
                      : "var(--warning-bg)",
                  color:
                    profile.verification_status === "approved"
                      ? "var(--success)"
                      : "var(--warning)",
                }}
              >
                {profile.verification_status || "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

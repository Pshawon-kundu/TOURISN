import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { guideAPI } from "../services/api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nid, setNid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nid.trim()) {
      setError("Please enter NID Number");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify NID against backend and get credentials
      const response = await guideAPI.loginWithNid(nid);

      console.log("Backend response:", response);

      if (response.data && response.data.success) {
        // Backend returns { email, phone }
        // We use phone as the password for Supabase Auth
        const { email, phone } = response.data;

        console.log("Attempting Supabase login with email:", email);

        // Step 2: Sign in to Supabase using the returned email and phone (as password)
        const result = await login(email, phone);

        if (result.success) {
          console.log("Login successful, navigating to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          console.error("Supabase login failed:", result.error);
          setError(result.error || "Login failed via authentication");
        }
      } else {
        setError(response.data?.error || "Verification failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      // More detailed error handling
      if (err.response) {
        // Backend responded with an error
        console.error("Backend error response:", err.response.data);
        setError(err.response.data?.error || "Server error occurred");
      } else if (err.request) {
        // Request was made but no response
        console.error("No response from server:", err.request);
        setError(
          "Cannot connect to server. Please ensure the backend is running.",
        );
      } else {
        // Something else happened
        console.error("Error:", err.message);
        setError(
          err.message ||
            "An unexpected error occurred. Please check your connection.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>
            TOURISN Guide Portal
          </div>
          <div style={{ color: "var(--muted)" }}>
            Sign in with your NID Number
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>
            NID Number
          </label>
          <input
            className="input"
            value={nid}
            onChange={(e) => setNid(e.target.value)}
            type="text"
            placeholder="Enter your NID Number"
          />
        </div>

        {error && <div style={{ color: "#fca5a5", fontSize: 13 }}>{error}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

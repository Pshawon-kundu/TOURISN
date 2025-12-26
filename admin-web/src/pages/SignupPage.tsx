import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const ok = await signup(email, password, name);
    setLoading(false);

    if (ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Failed to create admin account. Email may already exist.");
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>
            Create Admin Account
          </div>
          <div style={{ color: "var(--muted)" }}>
            Register as a new administrator
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>
            Full Name
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>
            Password
          </label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>
            Confirm Password
          </label>
          <input
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        {error && <div style={{ color: "#fca5a5", fontSize: 13 }}>{error}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
          <div
            style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              Login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

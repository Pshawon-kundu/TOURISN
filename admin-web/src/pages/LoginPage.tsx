import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>TOURISN Admin</div>
          <div style={{ color: "var(--muted)" }}>
            Sign in to manage the platform
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="admin@tourisn.com"
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
          />
        </div>

        {error && <div style={{ color: "#fca5a5", fontSize: 13 }}>{error}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <div
            style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              Create Admin Account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

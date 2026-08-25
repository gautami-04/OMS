import React, { useState } from "react";
import { Zap, Lock, Mail, AlertCircle } from "lucide-react";
import { authApi } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Zap size={22} fill="#fff" />
          </div>
          <div>
            <h2>GridControl OMS</h2>
            <p>Utility Grid Operations Center</p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: "4px",
              color: "#991B1B",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#98A098",
                }}
              />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: "32px" }}
                placeholder="admin@oms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#98A098",
                }}
              />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: "32px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          >
            {loading ? "Authenticating..." : "Sign In to Operations Center"}
          </button>
        </form>

        <div
          style={{
            borderTop: "1px solid #E8ECE7",
            paddingTop: "12px",
            fontSize: "11px",
            color: "#6D746D",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span>Quick Login Credentials:</span>
          <div><strong>Admin:</strong> admin@oms.com / Admin@123</div>
          <div><strong>Engineer:</strong> engineer@oms.com / Engineer@123</div>
        </div>
      </div>
    </div>
  );
}
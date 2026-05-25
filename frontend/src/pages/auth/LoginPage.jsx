import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function Icon({ name }) {
    const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
    const stroke = { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
    if (name === "user") {
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...stroke} />
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" {...stroke} />
        </svg>
      );
    }
    if (name === "lock") {
      return (
        <svg {...common}>
          <path d="M7 11V8a5 5 0 0 1 10 0v3" {...stroke} />
          <path d="M5 11h14v10H5V11Z" {...stroke} />
        </svg>
      );
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center ht-authWrap">
      <div className="ht-authBackdrop" aria-hidden="true" />

      <div className="ht-authModal animate-scale-in" role="dialog" aria-modal="true" aria-label="Login">
        <div className="ht-authHeader text-center">
          <div className="d-inline-flex align-items-center gap-3">
            <div className="ht-brandMark" aria-hidden="true" />
            <div className="text-start">
              <div className="ht-brandTitle" style={{ color: "var(--color-text)" }}>
                HARDTRAC
              </div>
              <div className="ht-muted">MVS Hardware</div>
            </div>
          </div>
        </div>

        <div className="ht-authBody">
          <h3 className="fw-bold mb-1">Welcome back</h3>
          <div className="ht-muted mb-4" style={{ fontSize: "1.05rem" }}>
            Sign in to continue
          </div>

          {error && <div className="alert alert-danger animate-fade-in">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold" style={{ fontSize: "1.05rem" }}>
              Username
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <Icon name="user" />
              </span>
              <input
                className="form-control form-control-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                required
              />
            </div>

            <label className="form-label fw-semibold" style={{ fontSize: "1.05rem" }}>
              Password
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <Icon name="lock" />
              </span>
              <input
                className="form-control form-control-lg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary w-100 btn-lg ht-btn ht-btnPrimary" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </button>

            <div className="mt-3 text-center ht-muted" style={{ fontSize: "0.95rem" }}>
              Tip: Default demo accounts are in the project README.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

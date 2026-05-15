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
    <div
      className="min-vh-100 d-flex align-items-stretch"
      style={{
        background:
          "radial-gradient(1000px 600px at 15% 10%, rgba(245,158,11,0.22), transparent 55%), radial-gradient(900px 500px at 85% 0%, rgba(30,58,95,0.35), transparent 55%), linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.0))"
      }}
    >
      <div className="container py-4 d-flex align-items-center">
        <div className="row g-3 w-100 align-items-stretch">
          <div className="col-lg-6 d-none d-lg-flex">
            <div className="ht-surface p-4 w-100 d-flex flex-column justify-content-between animate-slide-up">
              <div>
                <div className="d-flex align-items-center gap-3">
                  <div className="ht-brandMark" aria-hidden="true" />
                  <div>
                    <div className="ht-brandTitle text-dark" style={{ color: "var(--color-text)" }}>
                      HARDTRAC
                    </div>
                    <div className="ht-muted">MVS Hardware</div>
                  </div>
                </div>
                <hr />
                <h3 className="fw-bold mt-3">RFID & Barcode Integrated Inventory and Sales System</h3>
                <p className="ht-muted mb-0">
                  Strong. Reliable. Fast POS workflow.
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <span className="ht-pill">Inventory</span>
                <span className="ht-pill">POS</span>
                <span className="ht-pill">Reports</span>
                <span className="ht-pill">Audit Logs</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card ht-cardHover animate-scale-in">
              <div className="card-body p-4 p-md-5">
                <div className="d-lg-none mb-3 text-center">
                  <div className="d-inline-flex align-items-center gap-2">
                    <div className="ht-brandMark" aria-hidden="true" />
                    <div className="text-start">
                      <div className="ht-brandTitle" style={{ color: "var(--color-text)" }}>
                        HARDTRAC
                      </div>
                      <div className="ht-muted small">MVS Hardware</div>
                    </div>
                  </div>
                </div>

                <h4 className="fw-bold mb-1">Welcome back</h4>
                <div className="ht-muted mb-4">Sign in to continue</div>

                {error && <div className="alert alert-danger animate-fade-in">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <label className="form-label fw-semibold">Username</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <Icon name="user" />
                    </span>
                    <input
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                      autoComplete="username"
                      required
                    />
                  </div>

                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <Icon name="lock" />
                    </span>
                    <input
                      className="form-control"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-100 ht-btn ht-btnPrimary" disabled={submitting}>
                    {submitting ? "Signing in..." : "Login"}
                  </button>

                  <div className="mt-3 text-center ht-muted small">
                    Tip: Default demo accounts are in the project README.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

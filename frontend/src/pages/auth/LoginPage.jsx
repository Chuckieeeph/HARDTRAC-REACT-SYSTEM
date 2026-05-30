import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginPage() {
  const { login, rfidLogin } = useAuth();
  const navigate = useNavigate();
  const rfidInputRef = useRef(null);
  const rfidAutoSubmitRef = useRef(null);
  const lastRfidAttemptRef = useRef("");
  const [mode, setMode] = useState("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rfidValue, setRfidValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRfid, setShowRfid] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "rfid") {
      setTimeout(() => rfidInputRef.current?.focus(), 0);
    }
    return () => {
      clearTimeout(rfidAutoSubmitRef.current);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "rfid") return undefined;

    const scannedValue = rfidValue.trim();
    clearTimeout(rfidAutoSubmitRef.current);

    if (!scannedValue) {
      lastRfidAttemptRef.current = "";
      return undefined;
    }

    if (submitting) return undefined;
    if (scannedValue === lastRfidAttemptRef.current) return undefined;

    rfidAutoSubmitRef.current = setTimeout(() => {
      lastRfidAttemptRef.current = scannedValue;
      handleRfidSubmit();
    }, 300);

    return () => clearTimeout(rfidAutoSubmitRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rfidValue, submitting]);

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
    if (name === "rfid") {
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 0 1 8-8" {...stroke} />
          <path d="M7 12a5 5 0 0 1 5-5" {...stroke} />
          <path d="M10 12a2 2 0 0 1 2-2" {...stroke} />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    }
    if (name === "eye") {
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" {...stroke} />
          <circle cx="12" cy="12" r="3" {...stroke} />
        </svg>
      );
    }
    if (name === "eye-off") {
      return (
        <svg {...common}>
          <path d="M3 3l18 18" {...stroke} />
          <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" {...stroke} />
          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a20.26 20.26 0 0 1-4.13 4.86" {...stroke} />
          <path d="M6.1 6.1C3.89 8.05 2 12 2 12s3.5 7 10 7a11.18 11.18 0 0 0 3.1-.43" {...stroke} />
        </svg>
      );
    }
    return null;
  }

  async function handlePasswordSubmit(e) {
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

  async function handleRfidSubmit(e) {
    e?.preventDefault?.();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await rfidLogin(rfidValue.trim());
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "RFID login failed");
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

          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className={`btn btn-sm ${mode === "password" ? "btn-primary" : "btn-outline-secondary"} ht-btn ht-btnPrimary`}
              onClick={() => {
                setMode("password");
                setError("");
              }}
            >
              Username + Password
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === "rfid" ? "btn-primary" : "btn-outline-secondary"} ht-btn ht-btnPrimary`}
              onClick={() => {
                setMode("rfid");
                setError("");
                lastRfidAttemptRef.current = "";
              }}
            >
              RFID Scan
            </button>
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePasswordSubmit}>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} />
                </button>
              </div>

              <button className="btn btn-primary w-100 btn-lg ht-btn ht-btnPrimary" disabled={submitting}>
                {submitting ? "Signing in..." : "Login"}
              </button>

              <div className="mt-3 text-center ht-muted" style={{ fontSize: "0.95rem" }}>
                Tip: Default demo accounts are in the project README.
              </div>
            </form>
          ) : (
            <form onSubmit={handleRfidSubmit}>
              <label className="form-label fw-semibold" style={{ fontSize: "1.05rem" }}>
                RFID Value
              </label>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <Icon name="rfid" />
                </span>
                <input
                  ref={rfidInputRef}
                  className="form-control form-control-lg"
                  type={showRfid ? "text" : "password"}
                  value={rfidValue}
                  onChange={(e) => {
                    setRfidValue(e.target.value);
                    lastRfidAttemptRef.current = "";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRfidSubmit(e);
                  }}
                  placeholder="Scan RFID card or type the value"
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowRfid((value) => !value)}
                  aria-label={showRfid ? "Hide RFID value" : "Show RFID value"}
                >
                  <Icon name={showRfid ? "eye-off" : "eye"} />
                </button>
              </div>

              <button className="btn btn-primary w-100 btn-lg ht-btn ht-btnPrimary" disabled={submitting}>
                {submitting ? "Scanning..." : "Scan & Sign In"}
              </button>

              <div className="mt-3 text-center ht-muted" style={{ fontSize: "0.95rem" }}>
                RFID readers usually type the tag value and press Enter automatically.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CashierDashboard() {
  const { token, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/reports/cashier-dashboard");
      setSummary(data.summary);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        setError("Session expired. Please log in again.");
        return;
      }
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [token, load]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (loading && !summary) return <div>Loading...</div>;
  if (!summary) return <div className="alert alert-warning">No dashboard data yet.</div>;

  return (
    <>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">Cashier Dashboard</h4>
          <div className="ht-muted small">Auto-refreshing</div>
        </div>
        <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card ht-cardHover ht-statCard">
            <div className="card-body">
              <div className="text-muted small">Today's Sales</div>
              <div className="fs-4 fw-bold">₱ {Number(summary.today_sales).toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card ht-cardHover ht-statCard">
            <div className="card-body">
              <div className="text-muted small">Today's Transactions</div>
              <div className="fs-4 fw-bold">{summary.today_transactions}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="text-muted small">Quick Links</div>
              <a className="btn btn-primary btn-sm mt-2 ht-btn ht-btnAccent" href="/pos">
                Go to POS
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

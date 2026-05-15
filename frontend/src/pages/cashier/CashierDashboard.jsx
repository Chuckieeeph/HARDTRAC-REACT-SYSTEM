import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";

export default function CashierDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/reports/cashier-dashboard");
        setSummary(data.summary);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      }
    }
    load();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return <div>Loading...</div>;

  return (
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
  );
}

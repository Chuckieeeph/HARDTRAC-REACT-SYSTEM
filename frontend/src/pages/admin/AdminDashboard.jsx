import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";

function StatCard({ label, value, hint }) {
  return (
    <div className="col-md-3">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="text-muted small">{label}</div>
          <div className="fs-4 fw-bold">{value}</div>
          {hint && <div className="text-muted small">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/reports/admin-dashboard");
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
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Admin Dashboard</h4>
      </div>
      <div className="row g-3">
        <StatCard label="Total Products" value={summary.total_products} />
        <StatCard label="Low Stock" value={summary.low_stock_count} hint="<= reorder level" />
        <StatCard label="Out of Stock" value={summary.out_of_stock_count} />
        <StatCard label="Today's Sales" value={`₱ ${Number(summary.today_sales).toFixed(2)}`} />
      </div>
      <div className="row g-3 mt-1">
        <StatCard label="Today's Transactions" value={summary.today_transactions} />
        <StatCard label="Active Products" value={summary.active_products} />
      </div>
    </>
  );
}


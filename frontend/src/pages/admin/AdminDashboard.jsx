import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  const stroke = { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "box") return <svg {...common}><path d="M21 8.5 12 3 3 8.5 12 14l9-5.5Z" {...stroke} /><path d="M3 8.5V16l9 5 9-5V8.5" {...stroke} /><path d="M12 14v7" {...stroke} /></svg>;
  if (name === "alert") return <svg {...common}><path d="M12 9v4" {...stroke} /><path d="M12 17h.01" {...stroke} /><path d="M10.3 3.5h3.4L22 19H2L10.3 3.5Z" {...stroke} /></svg>;
  if (name === "cart") return <svg {...common}><path d="M6 6h15l-1.5 9h-12L6 6Z" {...stroke} /><path d="M6 6 5 3H2" {...stroke} /><path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" {...stroke} /></svg>;
  if (name === "receipt") return <svg {...common}><path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2Z" {...stroke} /><path d="M9 6h6M9 10h6M9 14h6" {...stroke} /></svg>;
  return null;
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="col-md-3">
      <div className="card ht-cardHover ht-statCard">
        <div className="card-body d-flex align-items-start justify-content-between">
          <div>
            <div className="ht-muted small">{label}</div>
            <div className="fs-4 fw-bold">{value}</div>
            {hint && <div className="ht-muted small">{hint}</div>}
          </div>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 40,
              height: 40,
              background: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.28)",
              color: "var(--color-accent)"
            }}
            aria-hidden="true"
          >
            <Icon name={icon} />
          </div>
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
        <h4 className="mb-0 ht-title">Admin Dashboard</h4>
      </div>
      <div className="row g-3">
        <StatCard label="Total Products" value={summary.total_products} icon="box" />
        <StatCard label="Low Stock" value={summary.low_stock_count} hint="<= reorder level" icon="alert" />
        <StatCard label="Out of Stock" value={summary.out_of_stock_count} icon="alert" />
        <StatCard label="Today's Sales" value={`₱ ${Number(summary.today_sales).toFixed(2)}`} icon="cart" />
      </div>
      <div className="row g-3 mt-1">
        <StatCard label="Today's Transactions" value={summary.today_transactions} icon="receipt" />
        <StatCard label="Active Products" value={summary.active_products} icon="box" />
      </div>
    </>
  );
}

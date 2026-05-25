import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";

export default function LowStockReportPage() {
  const [low, setLow] = useState([]);
  const [out, setOut] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [l, o] = await Promise.all([api.get("/inventory/low-stock"), api.get("/inventory/out-of-stock")]);
      setLow(l.data.products);
      setOut(o.data.products);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">Low Stock Report</h4>
          <div className="ht-muted small">Products that need reordering</div>
        </div>
        <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Low Stock</div>
              <ul className="mb-0">
                {low.map((p) => (
                  <li key={p.id}>
                    {p.name} ({p.current_stock} ≤ {p.reorder_level})
                  </li>
                ))}
                {low.length === 0 && <li className="text-muted">None</li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Out of Stock</div>
              <ul className="mb-0">
                {out.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
                {out.length === 0 && <li className="text-muted">None</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

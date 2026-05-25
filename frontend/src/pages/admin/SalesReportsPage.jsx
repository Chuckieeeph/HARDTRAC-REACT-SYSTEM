import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../services/api.js";
import { money, toInputDate } from "../../utils/format.js";
import { useAuth } from "../../context/AuthContext.jsx";

function downloadCsv(filename, rows) {
  const header = Object.keys(rows[0] || {}).join(",");
  const lines = rows.map((r) =>
    Object.values(r)
      .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
      .join(",")
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SalesReportsPage() {
  const { token, logout } = useAuth();
  const [from, setFrom] = useState(toInputDate(new Date()));
  const [to, setTo] = useState(toInputDate(new Date()));
  const [summary, setSummary] = useState(null);
  const [best, setBest] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => ({ from: from || undefined, to: to || undefined }), [from, to]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [s, b, c] = await Promise.all([
        api.get("/reports/sales-summary", { params }),
        api.get("/reports/best-sellers", { params: { ...params, limit: 10 } }),
        api.get("/reports/cashier-performance", { params })
      ]);
      setSummary(s.data.summary);
      setBest(b.data.rows);
      setCashiers(c.data.rows);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        logout();
        setError("Session expired. Please log in again.");
        return;
      }
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token, logout, params]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [token, load]);

  return (
    <>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">Sales Reports</h4>
          <div className="ht-muted small">Filter by date range · Auto-refreshing</div>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={() => window.print()}>
            Print
          </button>
          <button
            className="btn btn-outline-primary ht-btn ht-btnGhost"
            onClick={() => {
              if (!best.length) return;
              downloadCsv("best_sellers.csv", best);
            }}
          >
            Export Best Sellers CSV
          </button>
        </div>
      </div>

      <div className="card ht-cardHover mb-3">
        <div className="card-body d-flex flex-wrap gap-2 align-items-end">
          <div>
            <label className="form-label small mb-1">From</label>
            <input className="form-control" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label small mb-1">To</label>
            <input className="form-control" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary ht-btn ht-btnPrimary" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!summary ? (
        <div>Loading...</div>
      ) : (
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card ht-cardHover ht-statCard">
              <div className="card-body">
                <div className="text-muted small">Total Sales</div>
                <div className="fs-4 fw-bold">{money(summary.total_sales)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card ht-cardHover ht-statCard">
              <div className="card-body">
                <div className="text-muted small">Total Transactions</div>
                <div className="fs-4 fw-bold">{summary.total_transactions}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Best-Selling Products</div>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty Sold</th>
                      <th>Gross</th>
                    </tr>
                  </thead>
                  <tbody>
                    {best.map((r) => (
                      <tr key={r.product_id}>
                        <td>{r.product_name}</td>
                        <td>{r.qty_sold}</td>
                        <td>{money(r.gross_sales)}</td>
                      </tr>
                    ))}
                    {best.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">
                          No data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Cashier Performance</div>
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Cashier</th>
                      <th>Transactions</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashiers.map((r) => (
                      <tr key={r.cashier_id}>
                        <td>{r.full_name || r.username}</td>
                        <td>{r.total_transactions}</td>
                        <td>{money(r.total_sales)}</td>
                      </tr>
                    ))}
                    {cashiers.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-3">
                          No data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

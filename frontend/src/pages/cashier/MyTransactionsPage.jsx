import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { money } from "../../utils/format.js";

export default function MyTransactionsPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/sales");
      setSales(data.sales);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function viewSale(id) {
    try {
      const { data } = await api.get(`/sales/${id}`);
      setExpanded(data);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load sale");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0 ht-title">My Transactions</h4>
        <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="card ht-cardHover">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th className="text-end">Total</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td className="text-muted small">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="text-end fw-semibold">{money(s.total_amount)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary ht-btn ht-btnGhost" onClick={() => viewSale(s.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {expanded && (
        <div className="card ht-cardHover mt-3 animate-scale-in">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fw-semibold">Sale #{expanded.sale.id}</div>
              <button className="btn btn-sm btn-outline-secondary ht-btn ht-btnGhost" onClick={() => setExpanded(null)}>
                Close
              </button>
            </div>
            <div className="text-muted small">{new Date(expanded.sale.created_at).toLocaleString()}</div>
            <hr />
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expanded.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.product_name}</td>
                      <td className="text-end">{it.qty}</td>
                      <td className="text-end">{money(it.unit_price)}</td>
                      <td className="text-end">{money(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

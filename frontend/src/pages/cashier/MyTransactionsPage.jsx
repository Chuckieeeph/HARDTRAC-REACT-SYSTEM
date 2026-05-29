import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ConfirmModal from "../../shared/ConfirmModal.jsx";
import { money } from "../../utils/format.js";

export default function MyTransactionsPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);

  const canVoid = user?.role === "admin" || user?.role === "head-cashier";

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

  async function voidSale() {
    if (!voidTarget) return;
    try {
      await api.post(`/sales/${voidTarget.id}/void`);
      setVoidTarget(null);
      setExpanded(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to void sale");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">{canVoid ? "Transactions" : "My Transactions"}</h4>
          {canVoid && <div className="ht-muted small">Admins and head-cashiers can void completed sales.</div>}
        </div>
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
                <th>Status</th>
                <th className="text-end">Total</th>
                <th style={{ width: 220 }} />
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className={s.voided_at ? "table-warning" : ""}>
                  <td>{s.id}</td>
                  <td className="text-muted small">{new Date(s.created_at).toLocaleString()}</td>
                  <td>{s.voided_at ? <span className="badge text-bg-danger">Voided</span> : <span className="badge text-bg-success">Completed</span>}</td>
                  <td className="text-end fw-semibold">{money(s.total_amount)}</td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary ht-btn ht-btnGhost" onClick={() => viewSale(s.id)}>
                        View
                      </button>
                      {canVoid && !s.voided_at && (
                        <button className="btn btn-sm btn-outline-danger ht-btn" onClick={() => setVoidTarget(s)}>
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
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
            {expanded.sale.voided_at && (
              <div className="alert alert-warning py-2 mt-3 mb-0">
                Voided on {new Date(expanded.sale.voided_at).toLocaleString()}
                {expanded.sale.voided_by_name || expanded.sale.voided_by_username
                  ? ` by ${expanded.sale.voided_by_name || expanded.sale.voided_by_username}`
                  : ""}
                {expanded.sale.void_reason ? ` - ${expanded.sale.void_reason}` : ""}
              </div>
            )}
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

      <ConfirmModal
        show={Boolean(voidTarget)}
        title="Void Sale"
        body={
          <div>
            Void sale <b>#{voidTarget?.id}</b>? Stock will be restored and the transaction will be marked as voided.
          </div>
        }
        confirmText="Void Sale"
        onConfirm={voidSale}
        onClose={() => setVoidTarget(null)}
      />
    </>
  );
}

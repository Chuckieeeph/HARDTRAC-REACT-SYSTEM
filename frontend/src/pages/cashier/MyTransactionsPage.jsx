import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import ReceiptModal from "../../shared/ReceiptModal.jsx";
import { money } from "../../utils/format.js";

export default function MyTransactionsPage() {
  const { user } = useAuth();
  const voidRfidRef = useRef(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptPrintSettingsOpen, setReceiptPrintSettingsOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidRfid, setVoidRfid] = useState("");
  const [showVoidRfid, setShowVoidRfid] = useState(false);
  const [voiding, setVoiding] = useState(false);

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

  useEffect(() => {
    if (!voidTarget) return;
    setVoidReason("");
    setVoidRfid("");
    setTimeout(() => voidRfidRef.current?.focus(), 0);
  }, [voidTarget]);

  async function viewSale(id) {
    try {
      const { data } = await api.get(`/sales/${id}`);
      setExpanded(data);
      setReceiptOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load sale");
    }
  }

  async function voidSale() {
    if (!voidTarget) return;
    setVoiding(true);
    try {
      await api.post(`/sales/${voidTarget.id}/void`, {
        reason: voidReason.trim() || undefined,
        approvalRfid: voidRfid.trim()
      });
      setVoidTarget(null);
      setExpanded(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to void sale");
    } finally {
      setVoiding(false);
    }
  }

  function Icon({ name }) {
    const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
    const stroke = { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
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
        <div className="modal d-block ht-modalBackdrop animate-fade-in ht-transactionModalBackdrop" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered modal-xl ht-transactionDialog" role="document">
            <div className="modal-content ht-modalCard ht-transactionModal animate-scale-in">
              <div className="modal-header ht-receiptHeader">
                <div>
                  <div className="ht-receiptTitle">Sale #{expanded.sale.id}</div>
                  <div className="ht-receiptSubtitle">
                    {new Date(expanded.sale.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 ht-transactionHeaderActions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary ht-btn ht-btnGhost"
                    onClick={() => {
                      setReceiptPrintSettingsOpen(false);
                      setReceiptOpen(true);
                    }}
                  >
                    View Receipt
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary ht-btn ht-btnGhost"
                    onClick={() => {
                      setReceiptPrintSettingsOpen(true);
                      setReceiptOpen(true);
                    }}
                  >
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    className="btn-close ht-receiptClose"
                    onClick={() => {
                      setReceiptOpen(false);
                      setExpanded(null);
                    }}
                  />
                </div>
              </div>
              <div className="modal-body ht-transactionModalBody">
                <div className="ht-transactionDetailsPanel">
                  {expanded.sale.voided_at && (
                    <div className="alert alert-warning py-2 mt-0">
                      Voided on {new Date(expanded.sale.voided_at).toLocaleString()}
                      {expanded.sale.voided_by_name || expanded.sale.voided_by_username
                        ? ` by ${expanded.sale.voided_by_name || expanded.sale.voided_by_username}`
                        : ""}
                      {expanded.sale.void_reason ? ` - ${expanded.sale.void_reason}` : ""}
                    </div>
                  )}
                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <div className="ht-surface p-3 h-100">
                        <div className="text-muted small">Subtotal</div>
                        <div className="fw-bold">{money(expanded.sale.subtotal)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="ht-surface p-3 h-100">
                        <div className="text-muted small">Discount</div>
                        <div className="fw-bold">- {money(expanded.sale.discount_amount)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="ht-surface p-3 h-100">
                        <div className="text-muted small">Total</div>
                        <div className="fw-bold">{money(expanded.sale.total_amount)}</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="ht-surface p-3 h-100">
                        <div className="text-muted small">Status</div>
                        <div className="fw-bold">{expanded.sale.voided_at ? "Voided" : "Completed"}</div>
                      </div>
                    </div>
                  </div>
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
              <div className="modal-footer ht-transactionModalFooter">
                <button
                  type="button"
                  className="btn btn-secondary ht-btn ht-btnGhost"
                  onClick={() => {
                    setReceiptOpen(false);
                    setExpanded(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {expanded && (
        <ReceiptModal
          show={receiptOpen}
          data={expanded}
          onClose={() => setReceiptOpen(false)}
          initialShowPrintSettings={receiptPrintSettingsOpen}
        />
      )}

      {voidTarget && (
        <div className="modal d-block ht-modalBackdrop animate-fade-in" tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content ht-modalCard animate-scale-in">
              <div className="modal-header">
                <h5 className="modal-title">Void Sale</h5>
                <button type="button" className="btn-close" onClick={() => setVoidTarget(null)} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  voidSale();
                }}
              >
                <div className="modal-body">
                  <div className="mb-3">
                    Void sale <b>#{voidTarget.id}</b>? Stock will be restored and the transaction will be marked as voided.
                  </div>
                  <label className="form-label fw-semibold">Void Reason</label>
                  <input
                    className="form-control mb-3"
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Optional reason"
                  />
                  <label className="form-label fw-semibold">RFID Approval</label>
                  <div className="input-group">
                    <input
                      ref={voidRfidRef}
                      className="form-control"
                      type={showVoidRfid ? "text" : "password"}
                      value={voidRfid}
                      onChange={(e) => setVoidRfid(e.target.value)}
                      placeholder="Scan admin/head-cashier RFID"
                      autoComplete="off"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowVoidRfid((value) => !value)}
                      aria-label={showVoidRfid ? "Hide RFID value" : "Show RFID value"}
                    >
                      <Icon name={showVoidRfid ? "eye-off" : "eye"} />
                    </button>
                  </div>
                  <div className="text-muted small mt-2">
                    Scan the RFID card for the same admin or head cashier account that is signed in.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setVoidTarget(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={voiding || !voidRfid.trim()}>
                    {voiding ? "Voiding..." : "Void Sale"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

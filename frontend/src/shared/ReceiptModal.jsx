import React from "react";
import { money } from "../utils/format.js";

export default function ReceiptModal({ show, data, onClose }) {
  if (!show || !data) return null;
  const { sale, items } = data;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Receipt</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="text-center mb-3">
              <div className="fw-bold">MVS Hardware</div>
              <div className="text-muted small">HARDTRAC Receipt</div>
            </div>

            <div className="d-flex justify-content-between small text-muted">
              <div>Receipt #: {sale.id}</div>
              <div>{new Date(sale.created_at).toLocaleString()}</div>
            </div>
            <div className="small text-muted">Cashier: {sale.cashier_name || sale.cashier_username}</div>

            <hr />
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
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

            <div className="row">
              <div className="col-md-6" />
              <div className="col-md-6">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{money(sale.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Discount</span>
                  <span>- {money(sale.discount_amount)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>{money(sale.total_amount)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Cash</span>
                  <span>{money(sale.cash_received)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Change</span>
                  <span>{money(sale.change_amount)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={() => window.print()}>
              Print
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


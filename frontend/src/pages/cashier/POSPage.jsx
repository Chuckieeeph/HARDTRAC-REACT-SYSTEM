import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";
import ReceiptModal from "../../shared/ReceiptModal.jsx";
import { money } from "../../utils/format.js";

/**
 * Barcode/RFID scanner behavior (practical local web approach):
 * - Most USB barcode scanners and RFID readers "type" characters like a keyboard and often send an Enter key at the end.
 * - Keep focus on the Scan input field, scan the code, and handle Enter to submit.
 * - Manual typing works the same (type code and press Enter).
 */
export default function POSPage() {
  const scanRef = useRef(null);
  const [scanCode, setScanCode] = useState("");
  const [cart, setCart] = useState([]); // {productId, name, unitPrice, stock, qty}
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [receipt, setReceipt] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - Number(discountAmount || 0)), [subtotal, discountAmount]);
  const change = useMemo(() => Math.max(0, Number(cashReceived || 0) - total), [cashReceived, total]);

  async function findAndAdd(code) {
    const value = code.trim();
    if (!value) return;
    try {
      const { data } = await api.get("/products/search", { params: { code: value } });
      const p = data.product;

      setLastAddedId(p.id);
      setTimeout(() => setLastAddedId(null), 350);

      setCart((prev) => {
        const existing = prev.find((x) => x.productId === p.id);
        if (existing) {
          const nextQty = Math.min(existing.qty + 1, p.current_stock);
          if (nextQty === existing.qty) {
            setToast({ show: true, message: "Cannot add more than available stock", variant: "warning" });
            return prev;
          }
          return prev.map((x) => (x.productId === p.id ? { ...x, qty: nextQty, stock: p.current_stock } : x));
        }
        if (p.current_stock <= 0) {
          setToast({ show: true, message: "Product is out of stock", variant: "warning" });
          return prev;
        }
        return [
          ...prev,
          {
            productId: p.id,
            name: p.name,
            unitPrice: Number(p.selling_price),
            stock: Number(p.current_stock),
            qty: 1
          }
        ];
      });
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Product not found", variant: "danger" });
    } finally {
      setScanCode("");
      scanRef.current?.focus();
    }
  }

  function setQty(productId, qty) {
    setCart((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, qty } : it))
        .filter((it) => it.qty > 0)
    );
  }

  async function completeSale() {
    if (!cart.length) return setToast({ show: true, message: "Cart is empty", variant: "warning" });
    if (Number(cashReceived || 0) < total) return setToast({ show: true, message: "Insufficient cash", variant: "warning" });

    setSubmitting(true);
    try {
      const { data } = await api.post("/sales", {
        discountAmount: Number(discountAmount || 0),
        cashReceived: Number(cashReceived || 0),
        items: cart.map((it) => ({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice }))
      });
      setReceipt(data);
      setCart([]);
      setDiscountAmount(0);
      setCashReceived(0);
      setToast({ show: true, message: "Sale completed", variant: "success" });
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Sale failed", variant: "danger" });
    } finally {
      setSubmitting(false);
      scanRef.current?.focus();
    }
  }

  return (
    <>
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">POS</h4>
          <div className="ht-muted small">Scan barcode/RFID or type product code</div>
        </div>
        <button className="btn btn-outline-secondary ht-btn ht-btnGhost" onClick={() => scanRef.current?.focus()}>
          Focus Scan
        </button>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card ht-cardHover mb-3">
            <div className="card-body">
              <label className="form-label fw-semibold">Scan / Search</label>
              <input
                ref={scanRef}
                className="form-control form-control-lg ht-scanGlow"
                placeholder="Scan barcode or RFID then press Enter..."
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") findAndAdd(scanCode);
                }}
              />
              <div className="text-muted small mt-2">
                Tip: scanners usually act like keyboards; keep this field focused. Press <span className="ht-kbd">Enter</span> after typing.
              </div>
            </div>
          </div>

          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Cart</div>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((it) => (
                      <tr key={it.productId} className={it.productId === lastAddedId ? "animate-slide-up" : ""}>
                        <td>
                          <div className="fw-semibold">{it.name}</div>
                          <div className="text-muted small">Stock: {it.stock}</div>
                        </td>
                        <td className="text-end">{money(it.unitPrice)}</td>
                        <td className="text-center ht-cartQtyCell">
                          <div className="btn-group ht-cartQtyGroup" role="group">
                            <button
                              className="btn btn-outline-secondary btn-sm ht-btn ht-btnGhost"
                              onClick={() => setQty(it.productId, Math.max(1, it.qty - 1))}
                            >
                              -
                            </button>
                            <input
                              className="form-control form-control-sm text-center ht-fieldTiny"
                              value={it.qty}
                              onChange={(e) => {
                                const next = Number(e.target.value || 1);
                                if (!Number.isFinite(next)) return;
                                setQty(it.productId, Math.max(1, Math.min(next, it.stock)));
                              }}
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm ht-btn ht-btnGhost"
                              onClick={() => setQty(it.productId, Math.min(it.stock, it.qty + 1))}
                              disabled={it.qty >= it.stock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end">{money(it.unitPrice * it.qty)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-danger ht-btn" onClick={() => setQty(it.productId, 0)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Cart is empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card ht-cardHover">
            <div className="card-body">
              <div className="fw-semibold mb-2">Payment</div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                <span className="text-muted">Discount</span>
                <input
                  className="form-control form-control-sm text-end ht-fieldNarrow"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                <span className="text-muted">Cash</span>
                <input
                  className="form-control form-control-sm text-end ht-fieldNarrow"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">Change</span>
                <span className="fw-semibold">{money(change)}</span>
              </div>

              <button
                className="btn btn-primary w-100 mt-3 ht-btn ht-btnAccent"
                disabled={submitting}
                onClick={completeSale}
              >
                {submitting ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReceiptModal show={Boolean(receipt)} data={receipt} onClose={() => setReceipt(null)} />

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}

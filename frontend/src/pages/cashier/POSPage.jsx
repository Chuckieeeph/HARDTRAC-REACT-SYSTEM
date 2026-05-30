import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";
import ReceiptModal from "../../shared/ReceiptModal.jsx";
import { money } from "../../utils/format.js";

const POS_DRAFT_STORAGE_KEY = "hardtrac_pos_draft";

function loadPosDraft() {
  if (typeof window === "undefined") {
    return { cart: [], discountAmount: 0, cashReceived: 0 };
  }

  try {
    const rawDraft = window.localStorage.getItem(POS_DRAFT_STORAGE_KEY);
    if (!rawDraft) return { cart: [], discountAmount: 0, cashReceived: 0 };

    const parsedDraft = JSON.parse(rawDraft);
    const cart = Array.isArray(parsedDraft.cart)
      ? parsedDraft.cart
          .map((item) => ({
            productId: Number(item.productId),
            name: String(item.name || ""),
            unitPrice: Number(item.unitPrice || 0),
            stock: Number(item.stock || 0),
            qty: Number(item.qty || 1)
          }))
          .filter((item) => item.productId && item.name)
      : [];

    return {
      cart,
      discountAmount: Number(parsedDraft.discountAmount || 0),
      cashReceived: Number(parsedDraft.cashReceived || 0)
    };
  } catch {
    return { cart: [], discountAmount: 0, cashReceived: 0 };
  }
}

function savePosDraft(draft) {
  if (typeof window === "undefined") return;

  const normalizedCart = Array.isArray(draft.cart) ? draft.cart : [];
  const discountAmount = Number(draft.discountAmount || 0);
  const cashReceived = Number(draft.cashReceived || 0);

  if (!normalizedCart.length && discountAmount === 0 && cashReceived === 0) {
    window.localStorage.removeItem(POS_DRAFT_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    POS_DRAFT_STORAGE_KEY,
    JSON.stringify({
      cart: normalizedCart,
      discountAmount,
      cashReceived
    })
  );
}

function clearPosDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(POS_DRAFT_STORAGE_KEY);
}

/**
 * Barcode/RFID scanner behavior (practical local web approach):
 * - Most USB barcode scanners and RFID readers "type" characters like a keyboard and often send an Enter key at the end.
 * - Keep focus on the Scan input field, scan the code, and handle Enter to submit.
 * - Manual typing works the same (type code and press Enter).
 */
export default function POSPage() {
  const kioskContext = useOutletContext() ?? {};
  const posIntroOpen = kioskContext.posIntroOpen ?? false;
  const isPosOnHold = kioskContext.isPosOnHold ?? false;
  const setPosIntroOpen = kioskContext.setPosIntroOpen ?? (() => {});
  const setPosCursorMode = kioskContext.setPosCursorMode ?? (() => {});
  const setIsReceiptOpen = kioskContext.setIsReceiptOpen ?? (() => {});

  const scanRef = useRef(null);
  const discountRef = useRef(null);
  const cashRef = useRef(null);
  const completeRef = useRef(null);
  const [scanCode, setScanCode] = useState("");
  const savedDraft = useMemo(() => loadPosDraft(), []);
  const [cart, setCart] = useState(savedDraft.cart); // {productId, name, unitPrice, stock, qty}
  const [discountAmount, setDiscountAmount] = useState(savedDraft.discountAmount);
  const [cashReceived, setCashReceived] = useState(savedDraft.cashReceived);
  const draftStateRef = useRef({
    cart: savedDraft.cart,
    discountAmount: savedDraft.discountAmount,
    cashReceived: savedDraft.cashReceived
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [receipt, setReceipt] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const scanSubmitLockRef = useRef(false);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  useEffect(() => {
    setIsReceiptOpen(Boolean(receipt));
    return () => setIsReceiptOpen(false);
  }, [receipt, setIsReceiptOpen]);

  useEffect(() => {
    if (!posIntroOpen && !isPosOnHold) {
      scanRef.current?.focus();
    }
  }, [posIntroOpen, isPosOnHold]);

  useEffect(() => {
    const nextDraft = {
      cart,
      discountAmount: Number(discountAmount || 0),
      cashReceived: Number(cashReceived || 0)
    };
    draftStateRef.current = nextDraft;
    savePosDraft(nextDraft);
  }, [cart, discountAmount, cashReceived]);

  useEffect(() => {
    function persistDraft() {
      savePosDraft(draftStateRef.current);
    }

    window.addEventListener("beforeunload", persistDraft);
    window.addEventListener("pagehide", persistDraft);
    return () => {
      persistDraft();
      window.removeEventListener("beforeunload", persistDraft);
      window.removeEventListener("pagehide", persistDraft);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (isPosOnHold) {
        return;
      }

      if (e.key === "F1") {
        e.preventDefault();
        scanRef.current?.focus();
        scanRef.current?.select?.();
        return;
      }

      if (e.key === "F2") {
        e.preventDefault();
        discountRef.current?.focus();
        discountRef.current?.select?.();
        return;
      }

      if (e.key === "F3") {
        e.preventDefault();
        cashRef.current?.focus();
        cashRef.current?.select?.();
        return;
      }

      if (e.key === "F4") {
        e.preventDefault();
        completeRef.current?.click();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPosOnHold]);

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - Number(discountAmount || 0)), [subtotal, discountAmount]);
  const change = useMemo(() => Math.max(0, Number(cashReceived || 0) - total), [cashReceived, total]);

  const findAndAdd = useCallback(async (code) => {
    if (isPosOnHold) return;
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
  }, [isPosOnHold]);

  const handleScanEnter = useCallback(async (value) => {
    if (scanSubmitLockRef.current) return;
    scanSubmitLockRef.current = true;
    try {
      await findAndAdd(value);
    } finally {
      window.setTimeout(() => {
        scanSubmitLockRef.current = false;
      }, 0);
    }
  }, [findAndAdd]);

  const handleScanKeyEvent = useCallback(
    (e) => {
      const isEnterKey = e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter";
      if (!isEnterKey) return;

      e.preventDefault();
      e.stopPropagation();
      handleScanEnter(e.currentTarget.value);
    },
    [handleScanEnter]
  );

  function setQty(productId, qty) {
    setCart((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, qty } : it))
        .filter((it) => it.qty > 0)
    );
  }

  async function completeSale() {
    if (isPosOnHold) return;
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
      clearPosDraft();
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
      {isPosOnHold && (
        <div className="ht-posLockCard mb-3" role="status" aria-live="polite">
          <div className="ht-posLockEyebrow">POS STATUS</div>
          <h2 className="h4 mb-2">ON-HOLD</h2>
          <p className="text-muted mb-0">
            The POS is on hold, please click the <span className="ht-kbd">Esc</span> button to activate it.
          </p>
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="mb-0 ht-title">POS</h4>
          <div className="ht-muted small mt-1">Scan barcode/RFID or type product code</div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-secondary ht-btn ht-btnGhost"
            onClick={() => scanRef.current?.focus()}
            disabled={isPosOnHold}
            aria-keyshortcuts="F1"
          >
            {isPosOnHold ? "POS On Hold" : <>Focus Scan <span className="ms-2 ht-kbd">F1</span></>}
          </button>
          {!isPosOnHold && (
            <button
              className="btn btn-outline-danger ht-btn ht-btnGhost"
              onClick={() => {
                setPosIntroOpen(false);
                setPosCursorMode("ON_HOLD");
              }}
            >
              Shift + Esc
            </button>
          )}
        </div>
      </div>

      <div className="card ht-cardHover mb-3 ht-shortcutPanel">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-2">
            <div>
              <div className="fw-semibold">Keyboard shortcut hints</div>
              <div className="text-muted small">
                Press <span className="ht-kbd">Shift + Esc</span> to put the POS on hold and use the sidebar. While on hold, only <span className="ht-kbd">Esc</span> is active.
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {isPosOnHold ? (
                <span className="ht-pill"><span className="ht-kbd">Esc</span> Return to active mode</span>
              ) : (
                <>
                  <span className="ht-pill"><span className="ht-kbd">Enter</span> Add scanned item</span>
                  <span className="ht-pill"><span className="ht-kbd">F2</span> Discount</span>
                  <span className="ht-pill"><span className="ht-kbd">F3</span> Cash</span>
                  <span className="ht-pill"><span className="ht-kbd">F4</span> Complete sale</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card ht-cardHover mb-3">
            <div className="card-body">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <span>Scan / Search</span>
                <span className="ht-kbd">F1</span>
              </label>
              <input
                ref={scanRef}
                className="form-control form-control-lg ht-scanGlow"
                placeholder="Scan barcode or RFID then press Enter..."
                value={scanCode}
                disabled={isPosOnHold}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  setScanCode(e.target.value);
                }}
                aria-keyshortcuts="F1 Enter"
                onKeyDownCapture={handleScanKeyEvent}
                onKeyUpCapture={handleScanKeyEvent}
              />
              <div className="text-muted small mt-2">
                Tip: scanners usually act like keyboards and often send <span className="ht-kbd">Enter</span> automatically. If you type the barcode manually, press <span className="ht-kbd">Enter</span> to add the item.
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
                              disabled={isPosOnHold}
                              onClick={() => setQty(it.productId, Math.max(1, it.qty - 1))}
                            >
                              -
                            </button>
                            <input
                              className="form-control form-control-sm text-center ht-fieldTiny"
                              value={it.qty}
                              disabled={isPosOnHold}
                              onChange={(e) => {
                                const next = Number(e.target.value || 1);
                                if (!Number.isFinite(next)) return;
                                setQty(it.productId, Math.max(1, Math.min(next, it.stock)));
                              }}
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm ht-btn ht-btnGhost"
                              disabled={isPosOnHold || it.qty >= it.stock}
                              onClick={() => setQty(it.productId, Math.min(it.stock, it.qty + 1))}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end">{money(it.unitPrice * it.qty)}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger ht-btn"
                            disabled={isPosOnHold}
                            onClick={() => setQty(it.productId, 0)}
                          >
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
                <span className="text-muted d-flex align-items-center gap-2">
                  <span>Discount</span>
                  <span className="ht-kbd">F2</span>
                </span>
                <input
                  ref={discountRef}
                  className="form-control form-control-sm text-end ht-fieldNarrow"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  disabled={isPosOnHold}
                  aria-keyshortcuts="F2"
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                <span className="text-muted d-flex align-items-center gap-2">
                  <span>Cash</span>
                  <span className="ht-kbd">F3</span>
                </span>
                <input
                  ref={cashRef}
                  className="form-control form-control-sm text-end ht-fieldNarrow"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  disabled={isPosOnHold}
                  aria-keyshortcuts="F3"
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="text-muted">Change</span>
                <span className="fw-semibold">{money(change)}</span>
              </div>

              <button
                ref={completeRef}
                className="btn btn-primary w-100 mt-3 ht-btn ht-btnAccent"
                disabled={submitting || isPosOnHold}
                onClick={completeSale}
                aria-keyshortcuts="F4"
              >
                {submitting ? "Processing..." : "Complete Sale"}
                <span className="ms-2 ht-kbd">F4</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReceiptModal
        show={Boolean(receipt)}
        data={receipt}
        onClose={() => setReceipt(null)}
        onOpenChange={setIsReceiptOpen}
      />

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}

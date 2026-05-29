import React, { useEffect, useMemo, useState } from "react";
import { money } from "../utils/format.js";

const RECEIPT_PRINT_SETTINGS_KEY = "hardtrac_receipt_print_settings";

function loadPrintSettings() {
  if (typeof window === "undefined") {
    return {
      printerName: "",
      paperSize: "80mm",
      density: "standard",
      showCashier: true,
      showFooterNote: true
    };
  }

  try {
    const rawSettings = window.localStorage.getItem(RECEIPT_PRINT_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        printerName: "",
        paperSize: "80mm",
        density: "standard",
        showCashier: true,
        showFooterNote: true
      };
    }

    const parsedSettings = JSON.parse(rawSettings);
    return {
      printerName: String(parsedSettings.printerName || ""),
      paperSize: ["58mm", "80mm", "A4"].includes(parsedSettings.paperSize) ? parsedSettings.paperSize : "80mm",
      density: parsedSettings.density === "compact" ? "compact" : "standard",
      showCashier: parsedSettings.showCashier !== false,
      showFooterNote: parsedSettings.showFooterNote !== false
    };
  } catch {
    return {
      printerName: "",
      paperSize: "80mm",
      density: "standard",
      showCashier: true,
      showFooterNote: true
    };
  }
}

export default function ReceiptModal({ show, data, onClose }) {
  if (!show || !data) return null;
  const { sale, items } = data;
  const receiptNumber = String(sale.id).padStart(6, "0");
  const receiptDate = new Date(sale.created_at).toLocaleString();
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState(loadPrintSettings);
  const receiptWidth = useMemo(() => {
    if (printSettings.paperSize === "58mm") return "58mm";
    if (printSettings.paperSize === "A4") return "100%";
    return "80mm";
  }, [printSettings.paperSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RECEIPT_PRINT_SETTINGS_KEY, JSON.stringify(printSettings));
  }, [printSettings]);

  useEffect(() => {
    function afterPrintCleanup() {
      document.documentElement.removeAttribute("data-receipt-paper");
      document.documentElement.removeAttribute("data-receipt-density");
    }

    window.addEventListener("afterprint", afterPrintCleanup);
    return () => window.removeEventListener("afterprint", afterPrintCleanup);
  }, []);

  function handlePrint() {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-receipt-paper", printSettings.paperSize);
    document.documentElement.setAttribute("data-receipt-density", printSettings.density);
    window.requestAnimationFrame(() => {
      window.print();
    });
  }

  return (
    <div className="modal d-block ht-modalBackdrop animate-fade-in" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-scrollable ht-receiptDialog" role="document">
        <div className="modal-content ht-modalCard ht-receiptPrintRoot animate-scale-in">
          <div className="modal-header ht-receiptHeader">
            <div>
              <div className="ht-receiptTitle">Receipt</div>
              <div className="ht-receiptSubtitle">Printable sales ticket</div>
            </div>
            <button type="button" className="btn-close ht-receiptClose" onClick={onClose} />
          </div>
          <div className="modal-body ht-receiptBody">
            {showPrintSettings ? (
              <div className="ht-receiptSettingsPanel">
                <div className="ht-receiptSettingsHeader">
                  <div className="ht-receiptSettingsTitle">Printer settings</div>
                  <div className="ht-receiptSettingsNote">
                    Your printer must already be installed in Windows. Select it in the browser print dialog after
                    clicking <span className="ht-kbd">Open Print Dialog</span>.
                  </div>
                </div>

                <div className="ht-receiptSettingsGrid">
                  <label className="form-label fw-semibold mb-1">Printer name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Epson TM-T82X"
                    value={printSettings.printerName}
                    onChange={(e) => setPrintSettings((current) => ({ ...current, printerName: e.target.value }))}
                  />

                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-1">Paper size</label>
                      <select
                        className="form-select"
                        value={printSettings.paperSize}
                        onChange={(e) =>
                          setPrintSettings((current) => ({ ...current, paperSize: e.target.value }))
                        }
                      >
                        <option value="58mm">58mm thermal</option>
                        <option value="80mm">80mm thermal</option>
                        <option value="A4">A4 / office printer</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold mb-1">Density</label>
                      <select
                        className="form-select"
                        value={printSettings.density}
                        onChange={(e) =>
                          setPrintSettings((current) => ({ ...current, density: e.target.value }))
                        }
                      >
                        <option value="compact">Compact</option>
                        <option value="standard">Standard</option>
                      </select>
                    </div>
                  </div>

                  <div className="ht-receiptToggleList">
                    <label className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={printSettings.showCashier}
                        onChange={(e) =>
                          setPrintSettings((current) => ({ ...current, showCashier: e.target.checked }))
                        }
                      />
                      <span className="form-check-label">Show cashier name on receipt</span>
                    </label>
                    <label className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={printSettings.showFooterNote}
                        onChange={(e) =>
                          setPrintSettings((current) => ({ ...current, showFooterNote: e.target.checked }))
                        }
                      />
                      <span className="form-check-label">Show thank-you footer</span>
                    </label>
                  </div>

                  <div className="ht-receiptPreviewWrap">
                    <div className="ht-receiptPreviewLabel">Preview</div>
                    <div className="ht-receiptSheet" style={{ width: receiptWidth }}>
                      <div className="text-center">
                        <div className="ht-receiptBrand">MVS Hardware</div>
                        <div className="ht-receiptShop">HARDTRAC POS Receipt</div>
                        <div className="ht-receiptMuted">Cashier sales slip</div>
                      </div>

                      <div className="ht-receiptDivider" />

                      <div className="ht-receiptMeta">
                        <div className="ht-receiptMetaRow">
                          <span>Receipt No.</span>
                          <span>#{receiptNumber}</span>
                        </div>
                        <div className="ht-receiptMetaRow">
                          <span>Date &amp; Time</span>
                          <span>{receiptDate}</span>
                        </div>
                        {printSettings.showCashier && (
                          <div className="ht-receiptMetaRow">
                            <span>Cashier</span>
                            <span>{sale.cashier_name || sale.cashier_username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ht-receiptSheet" style={{ width: receiptWidth }}>
              <div className="text-center">
                <div className="ht-receiptBrand">MVS Hardware</div>
                <div className="ht-receiptShop">HARDTRAC POS Receipt</div>
                <div className="ht-receiptMuted">Cashier sales slip</div>
              </div>

              <div className="ht-receiptDivider" />

              <div className="ht-receiptMeta">
                <div className="ht-receiptMetaRow">
                  <span>Receipt No.</span>
                  <span>#{receiptNumber}</span>
                </div>
                <div className="ht-receiptMetaRow">
                  <span>Date &amp; Time</span>
                  <span>{receiptDate}</span>
                </div>
                <div className="ht-receiptMetaRow">
                  <span>Cashier</span>
                  <span>{sale.cashier_name || sale.cashier_username}</span>
                </div>
              </div>

              <div className="ht-receiptDivider" />

              <div className="ht-receiptItems">
                {items.map((it) => (
                  <div className="ht-receiptItem" key={it.id}>
                    <div className="ht-receiptItemTop">
                      <span className="ht-receiptItemName">{it.product_name}</span>
                      <span className="ht-receiptItemTotal">{money(it.line_total)}</span>
                    </div>
                    <div className="ht-receiptItemMeta">
                      <span>{it.qty} x {money(it.unit_price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ht-receiptDivider" />

              <div className="ht-receiptTotals">
                <div className="ht-receiptTotalRow">
                  <span>Subtotal</span>
                  <span>{money(sale.subtotal)}</span>
                </div>
                <div className="ht-receiptTotalRow">
                  <span>Discount</span>
                  <span>- {money(sale.discount_amount)}</span>
                </div>
                <div className="ht-receiptTotalRow ht-receiptGrandTotal">
                  <span>Total</span>
                  <span>{money(sale.total_amount)}</span>
                </div>
                <div className="ht-receiptTotalRow">
                  <span>Cash</span>
                  <span>{money(sale.cash_received)}</span>
                </div>
                <div className="ht-receiptTotalRow">
                  <span>Change</span>
                  <span>{money(sale.change_amount)}</span>
                </div>
              </div>

              <div className="ht-receiptDivider" />

              <div className="ht-receiptFooter">
                {printSettings.showFooterNote && (
                  <>
                    <div>Thank you for shopping with us.</div>
                    <div>Please keep this receipt for warranty or returns.</div>
                  </>
                )}
              </div>
            </div>
            )}
          </div>
          <div className="modal-footer ht-receiptActions">
            <button className="btn btn-outline-secondary" onClick={() => setShowPrintSettings((current) => !current)}>
              {showPrintSettings ? "Back" : "Print"}
            </button>
            <div className="d-flex gap-2">
              {showPrintSettings ? (
                <button className="btn btn-primary ht-btn ht-btnPrimary" onClick={handlePrint}>
                  Open Print Dialog
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={() => setShowPrintSettings(true)}>
                  Printer Settings
                </button>
              )}
              <button className="btn btn-primary ht-btn ht-btnPrimary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

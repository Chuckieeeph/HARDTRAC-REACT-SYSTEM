import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { money } from "../utils/format.js";

const RECEIPT_PRINT_SETTINGS_KEY = "hardtrac_receipt_print_settings";
const PX_PER_MM = 96 / 25.4;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

function ReceiptTicket({ sale, items, receiptNumber, receiptDate, printSettings, widthClass = "" }) {
  return (
    <div className={`ht-receiptSheet ${widthClass}`.trim()}>
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

      <div className="ht-receiptDivider" />

      <div className="ht-receiptItems">
        {items.map((it) => (
          <div className="ht-receiptItem" key={it.id}>
            <div className="ht-receiptItemTop">
              <span className="ht-receiptItemName">{it.product_name}</span>
              <span className="ht-receiptItemTotal">{money(it.line_total)}</span>
            </div>
            <div className="ht-receiptItemMeta">
              <span>
                {it.qty} x {money(it.unit_price)}
              </span>
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
  );
}

function buildReceiptPrintDocument({ sale, items, receiptNumber, receiptDate, printSettings, paperHeightMm }) {
  const paperWidth = printSettings.paperSize === "58mm" ? "58mm" : "80mm";
  const itemRows = items
    .map(
      (item) => `
        <div class="item">
          <div class="item-top">
            <span class="item-name">${escapeHtml(item.product_name)}</span>
            <span class="item-total">${escapeHtml(money(item.line_total))}</span>
          </div>
          <div class="item-meta">${escapeHtml(item.qty)} x ${escapeHtml(money(item.unit_price))}</div>
        </div>
      `
    )
    .join("");

  const cashierRow = printSettings.showCashier
    ? `
        <div class="meta-row">
          <span>Cashier</span>
          <span>${escapeHtml(sale.cashier_name || sale.cashier_username || "")}</span>
        </div>
      `
    : "";

  const footerNote = printSettings.showFooterNote
    ? `
        <div>Thank you for shopping with us.</div>
        <div>Please keep this receipt for warranty or returns.</div>
      `
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HARDTRAC Receipt</title>
    <style>
      @page {
        size: ${paperWidth} ${paperHeightMm}mm;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: ${paperWidth};
        background: #fff;
        color: #111827;
      }

      body {
        display: inline-block;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      }

      .receipt {
        width: ${paperWidth};
        margin: 0;
        padding: 0;
        background: #fff;
      }

      .text-center {
        text-align: center;
      }

      .brand {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .shop {
        margin-top: 0.15rem;
        font-size: 0.9rem;
        font-weight: 700;
      }

      .muted {
        color: #6b7280;
        font-size: 0.82rem;
      }

      .divider {
        border-top: 1px dashed #cbd5e1;
        margin: 0.85rem 0;
      }

      .meta,
      .totals {
        display: grid;
        gap: 0.4rem;
        font-size: 0.88rem;
      }

      .meta-row,
      .total-row,
      .item-top {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .item {
        display: grid;
        gap: 0.15rem;
        padding: 0.15rem 0;
      }

      .item-name,
      .total-row {
        font-weight: 700;
      }

      .item-meta {
        color: #6b7280;
        font-size: 0.82rem;
      }

      .grand-total {
        font-size: 1rem;
        border-top: 1px solid #d1d5db;
        padding-top: 0.35rem;
        margin-top: 0.15rem;
      }

      .footer {
        text-align: center;
        color: #6b7280;
        font-size: 0.82rem;
        line-height: 1.45;
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="text-center">
        <div class="brand">MVS Hardware</div>
        <div class="shop">HARDTRAC POS Receipt</div>
        <div class="muted">Cashier sales slip</div>
      </div>
      <div class="divider"></div>
      <div class="meta">
        <div class="meta-row">
          <span>Receipt No.</span>
          <span>#${escapeHtml(receiptNumber)}</span>
        </div>
        <div class="meta-row">
          <span>Date &amp; Time</span>
          <span>${escapeHtml(receiptDate)}</span>
        </div>
        ${cashierRow}
      </div>
      <div class="divider"></div>
      <div class="items">${itemRows}</div>
      <div class="divider"></div>
      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${escapeHtml(money(sale.subtotal))}</span>
        </div>
        <div class="total-row">
          <span>Discount</span>
          <span>- ${escapeHtml(money(sale.discount_amount))}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total</span>
          <span>${escapeHtml(money(sale.total_amount))}</span>
        </div>
        <div class="total-row">
          <span>Cash</span>
          <span>${escapeHtml(money(sale.cash_received))}</span>
        </div>
        <div class="total-row">
          <span>Change</span>
          <span>${escapeHtml(money(sale.change_amount))}</span>
        </div>
      </div>
      <div class="divider"></div>
      <div class="footer">
        ${footerNote}
      </div>
    </div>
  </body>
</html>`;
}

export default function ReceiptModal({ show, data, onClose, onOpenChange, initialShowPrintSettings = false }) {
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState(loadPrintSettings);
  const footerButtonRefs = useRef([]);
  const restoreMouseLockRef = useRef(false);

  const receipt = data ?? null;
  const sale = receipt?.sale;
  const items = receipt?.items ?? [];
  const receiptNumber = sale ? String(sale.id).padStart(6, "0") : "";
  const receiptDate = sale ? new Date(sale.created_at).toLocaleString() : "";

  const receiptWidth = useMemo(() => {
    if (printSettings.paperSize === "58mm") return "ht-receiptWidth58";
    if (printSettings.paperSize === "A4") return "ht-receiptWidthA4";
    return "ht-receiptWidth80";
  }, [printSettings.paperSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RECEIPT_PRINT_SETTINGS_KEY, JSON.stringify(printSettings));
  }, [printSettings]);

  useEffect(() => {
    onOpenChange?.(show);
    return () => onOpenChange?.(false);
  }, [show, onOpenChange]);

  useEffect(() => {
    if (show) {
      setShowPrintSettings(Boolean(initialShowPrintSettings));
    }
  }, [show, initialShowPrintSettings]);

  useLayoutEffect(() => {
    if (!show) return;

    restoreMouseLockRef.current =
      document.body.classList.contains("ht-posMouseLocked") ||
      document.documentElement.classList.contains("ht-posMouseLocked");
    document.body.classList.remove("ht-posMouseLocked");
    document.documentElement.classList.remove("ht-posMouseLocked");

    return () => {
      if (!restoreMouseLockRef.current) return;
      document.body.classList.add("ht-posMouseLocked");
      document.documentElement.classList.add("ht-posMouseLocked");
    };
  }, [show]);

  useEffect(() => {
    function afterPrintCleanup() {
      document.documentElement.removeAttribute("data-receipt-paper");
      document.documentElement.removeAttribute("data-receipt-density");
    }

    window.addEventListener("afterprint", afterPrintCleanup);
    return () => window.removeEventListener("afterprint", afterPrintCleanup);
  }, []);

  useEffect(() => {
    if (!show) return;
    const firstButton = footerButtonRefs.current[0];
    firstButton?.focus?.();
  }, [show, showPrintSettings]);

  function handlePrint(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (typeof window === "undefined") return;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const cleanup = () => {
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("afterprint", cleanup);
      iframe.remove();
      document.documentElement.removeAttribute("data-receipt-paper");
      document.documentElement.removeAttribute("data-receipt-density");
    };

    const onLoad = () => {
      const iframeWindow = iframe.contentWindow;
      const iframeDocument = iframe.contentDocument;
      if (!iframeWindow || !iframeDocument) {
        cleanup();
        return;
      }

      const body = iframeDocument.body;
      const baseHeightMm = Math.ceil(body.scrollHeight / PX_PER_MM);
      const paperHeightMm = Math.max(40, baseHeightMm + 6);
      iframeDocument.querySelector('style[data-print-style]')?.setAttribute("data-paper-height-mm", String(paperHeightMm));
      const styleNode = iframeDocument.createElement("style");
      styleNode.setAttribute("data-print-style", "true");
      styleNode.textContent = `
        @page { size: ${printSettings.paperSize === "58mm" ? "58mm" : "80mm"} ${paperHeightMm}mm; margin: 0; }
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          width: ${printSettings.paperSize === "58mm" ? "58mm" : "80mm"};
          background: #fff;
          color: #111827;
        }
        body { display: inline-block; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        .receipt { width: ${printSettings.paperSize === "58mm" ? "58mm" : "80mm"}; margin: 0; padding: 0; background: #fff; }
        .text-center { text-align: center; }
        .brand { font-size: 1.25rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
        .shop { margin-top: 0.15rem; font-size: 0.9rem; font-weight: 700; }
        .muted { color: #6b7280; font-size: 0.82rem; }
        .divider { border-top: 1px dashed #cbd5e1; margin: 0.85rem 0; }
        .meta, .totals { display: grid; gap: 0.4rem; font-size: 0.88rem; }
        .meta-row, .total-row, .item-top { display: flex; justify-content: space-between; gap: 0.75rem; }
        .item { display: grid; gap: 0.15rem; padding: 0.15rem 0; }
        .item-name, .total-row { font-weight: 700; }
        .item-meta { color: #6b7280; font-size: 0.82rem; }
        .grand-total { font-size: 1rem; border-top: 1px solid #d1d5db; padding-top: 0.35rem; margin-top: 0.15rem; }
        .footer { text-align: center; color: #6b7280; font-size: 0.82rem; line-height: 1.45; }
      `;
      iframeDocument.head.appendChild(styleNode);

      iframeWindow.focus();
      window.setTimeout(() => {
        iframeWindow.print();
      }, 0);
    };

    iframe.addEventListener("load", onLoad);
    window.addEventListener("afterprint", cleanup);

    const printDocument = iframe.contentDocument;
    if (!printDocument) {
      cleanup();
      return;
    }

    printDocument.open();
    printDocument.write(
      buildReceiptPrintDocument({
        sale,
        items,
        receiptNumber,
        receiptDate,
        printSettings,
        paperHeightMm: 80
      })
    );
    printDocument.close();
  }

  function focusButton(nextIndex) {
    const buttons = footerButtonRefs.current.filter(Boolean);
    if (!buttons.length) return;
    const currentIndex = Math.max(0, Math.min(nextIndex, buttons.length - 1));
    buttons[currentIndex]?.focus?.();
  }

  function handleFooterKeyDown(event) {
    const buttons = footerButtonRefs.current.filter(Boolean);
    if (!buttons.length) return;

    const activeIndex = buttons.findIndex((button) => button === document.activeElement);
    if (activeIndex === -1) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusButton((activeIndex + 1) % buttons.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusButton((activeIndex - 1 + buttons.length) % buttons.length);
    }
  }

  if (!show || !receipt) return null;

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
                <div className="ht-receiptSettingsControls">
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
                  </div>
                </div>

                <div className="ht-receiptPreviewWrap">
                  <div className="ht-receiptPreviewLabel">Preview</div>
                  <ReceiptTicket
                    sale={sale}
                    items={items}
                    receiptNumber={receiptNumber}
                    receiptDate={receiptDate}
                    printSettings={printSettings}
                    widthClass={receiptWidth}
                  />
                </div>
              </div>
            ) : (
              <ReceiptTicket
                sale={sale}
                items={items}
                receiptNumber={receiptNumber}
                receiptDate={receiptDate}
                printSettings={printSettings}
                widthClass={receiptWidth}
              />
            )}
          </div>
          <div className="modal-footer ht-receiptActions" onKeyDown={handleFooterKeyDown}>
              <button
                type="button"
                ref={(node) => {
                  footerButtonRefs.current[0] = node;
                }}
                className="btn btn-outline-secondary"
                onClick={() => setShowPrintSettings((current) => !current)}
            >
              {showPrintSettings ? "Back" : "Print"}
            </button>
            <div className="d-flex gap-2">
              {showPrintSettings ? (
                <button
                  type="button"
                  ref={(node) => {
                    footerButtonRefs.current[1] = node;
                  }}
                  className="btn btn-primary ht-btn ht-btnPrimary"
                  onClick={handlePrint}
                >
                  Open Print Dialog
                </button>
              ) : (
                <button
                  type="button"
                  ref={(node) => {
                    footerButtonRefs.current[1] = node;
                  }}
                  className="btn btn-secondary"
                  onClick={() => setShowPrintSettings(true)}
                >
                  Printer Settings
                </button>
              )}
              <button
                type="button"
                ref={(node) => {
                  footerButtonRefs.current[2] = node;
                }}
                className="btn btn-primary ht-btn ht-btnPrimary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

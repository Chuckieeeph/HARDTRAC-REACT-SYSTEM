import React, { useEffect } from "react";

export default function ConfirmModal({ show, title, body, confirmText = "Confirm", onConfirm, onClose }) {
  if (!show) return null;

  // Close on Escape for accessibility
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal d-block ht-modalBackdrop animate-fade-in" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content ht-modalCard animate-scale-in">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">{body}</div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

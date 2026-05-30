import { Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "../shared/Sidebar.jsx";
import Topbar from "../shared/Topbar.jsx";
import Toast from "../shared/Toast.jsx";

const POS_DRAFT_STORAGE_KEY = "hardtrac_pos_draft";

function getPosCartCount() {
  if (typeof window === "undefined") return 0;

  try {
    const rawDraft = window.localStorage.getItem(POS_DRAFT_STORAGE_KEY);
    if (!rawDraft) return 0;

    const parsedDraft = JSON.parse(rawDraft);
    return Array.isArray(parsedDraft.cart) ? parsedDraft.cart.length : 0;
  } catch {
    return 0;
  }
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("hardtrac_sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [posPhase, setPosPhase] = useState("intro");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "warning" });
  const location = useLocation();
  const isPosRoute = location.pathname === "/pos";
  const posIntroOpen = posPhase === "intro";
  const isPosOnHold = posPhase === "hold";

  function enterPos() {
    setPosPhase("active");
  }

  function holdPos() {
    setPosPhase("hold");
  }

  function activatePos() {
    setPosPhase("active");
  }

  function setPosIntroOpen(open) {
    setPosPhase(open ? "intro" : "active");
  }

  useEffect(() => {
    localStorage.setItem("hardtrac_sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      const isEscapeKey = e.key === "Escape" || e.key === "Esc" || e.code === "Escape";
      const isEnterKey = e.key === "Enter";
      const isPosShortcutKey = ["F1", "F2", "F3", "F4"].includes(e.key);

      if (isPosRoute && posIntroOpen && isEnterKey) {
        e.preventDefault();
        e.stopPropagation();
        enterPos();
        return;
      }

      if (!isPosRoute || !isEscapeKey) {
        if (isEscapeKey) setMobileOpen(false);
        if (isPosRoute && isPosOnHold && isPosShortcutKey) {
          e.preventDefault();
          e.stopPropagation();
          setToast({ show: true, message: "The POS is on-hold, click the esc key to activate it.", variant: "warning" });
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey) {
        setPosPhase("hold");
        return;
      }

      if (isPosOnHold) {
        setPosPhase("active");
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isPosRoute, isPosOnHold]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 992) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // Prevent "stuck" no-scroll if an overlay/menu state gets out of sync.
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const isLocked = isPosRoute && !isPosOnHold && !isReceiptOpen;
    document.body.classList.toggle("ht-posMouseLocked", isLocked);
    document.documentElement.classList.toggle("ht-posMouseLocked", isLocked);
    return () => {
      document.body.classList.remove("ht-posMouseLocked");
      document.documentElement.classList.remove("ht-posMouseLocked");
    };
  }, [isPosRoute, isPosOnHold, isReceiptOpen]);

  const outletContext = {
    isPosRoute,
    posIntroOpen,
    isPosOnHold,
    setPosIntroOpen,
    setPosCursorMode: setPosPhase,
    setIsReceiptOpen
  };

  return (
    <div
      className={`d-flex ht-app ${collapsed ? "ht-sidebarCollapsed" : ""} ${mobileOpen ? "ht-mobileOpen" : ""} ${
        isPosRoute && isPosOnHold ? "ht-posHoldMode ht-posSidebarOnly" : ""
      }`}
    >
      {mobileOpen && <div className="ht-mobileOverlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="ht-content">
        <Topbar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
          isPosRoute={isPosRoute}
          onLogoutBlocked={() =>
            setToast({
              show: true,
              message: "Finish or clear the current POS cart before logging out.",
              variant: "warning"
            })
          }
          canLogout={() => getPosCartCount() === 0}
        />
        <main className="ht-main container-fluid">
          <div className="animate-slide-up">
            <Outlet context={outletContext} />
          </div>
        </main>
        {isPosRoute && (posIntroOpen || isPosOnHold) && (
          <div className="ht-posLockOverlay" aria-live="polite" role="status">
            <div className="ht-posLockCard">
              {isPosOnHold ? (
                <>
                  <div className="ht-posLockEyebrow">POS STATUS</div>
                  <h2 className="h4 mb-2">ON-HOLD</h2>
                  <p className="text-muted mb-3">
                    The POS is on hold, please click the <span className="ht-kbd">Esc</span> button to activate it.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary ht-btn ht-btnAccent w-100"
                    autoFocus
                    onClick={activatePos}
                  >
                    Activate POS <span className="ms-2 ht-kbd">Esc</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="ht-posLockEyebrow">Keyboard-only POS mode</div>
                  <h2 className="h4 mb-2">Mouse disabled for cashier safety</h2>
                  <p className="text-muted mb-3">
                    Use the keyboard to scan items, adjust totals, and complete sales. Press <span className="ht-kbd">Enter</span> to enter the POS screen. Press <span className="ht-kbd">Shift + Esc</span> to put POS on hold and use the sidebar.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary ht-btn ht-btnAccent w-100"
                    autoFocus
                    onClick={enterPos}
                  >
                    Enter POS <span className="ms-2 ht-kbd">Enter</span>
                  </button>
                  <div className="ht-shortcutGrid">
                    <div className="ht-shortcutItem">
                      <span className="ht-shortcutKey">F1</span>
                      <span className="ht-shortcutAction">Focus scan box</span>
                    </div>
                    <div className="ht-shortcutItem">
                      <span className="ht-shortcutKey">F2</span>
                      <span className="ht-shortcutAction">Jump to discount</span>
                    </div>
                    <div className="ht-shortcutItem">
                      <span className="ht-shortcutKey">F3</span>
                      <span className="ht-shortcutAction">Jump to cash</span>
                    </div>
                    <div className="ht-shortcutItem">
                      <span className="ht-shortcutKey">F4</span>
                      <span className="ht-shortcutAction">Complete sale</span>
                    </div>
                    <div className="ht-shortcutItem">
                      <span className="ht-shortcutKey">Shift + Esc</span>
                      <span className="ht-shortcutAction">Put POS on hold</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="ht-posOverlayToast">
              <Toast
                show={toast.show}
                message={toast.message}
                variant={toast.variant}
                onClose={() => setToast({ ...toast, show: false })}
              />
            </div>
          </div>
        )}
      </div>
      {!isPosRoute && (
        <Toast
          show={toast.show}
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

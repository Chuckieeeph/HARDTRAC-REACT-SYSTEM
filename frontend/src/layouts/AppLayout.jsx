import { Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "../shared/Sidebar.jsx";
import Topbar from "../shared/Topbar.jsx";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("hardtrac_sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [posIntroOpen, setPosIntroOpen] = useState(false);
  const [posMouseUnlocked, setPosMouseUnlocked] = useState(false);
  const location = useLocation();
  const isPosRoute = location.pathname === "/pos";

  useEffect(() => {
    localStorage.setItem("hardtrac_sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  useEffect(() => {
    if (!isPosRoute) {
      setPosIntroOpen(false);
      setPosMouseUnlocked(false);
      return;
    }
    setPosIntroOpen(true);
    setPosMouseUnlocked(false);
  }, [isPosRoute]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
    const isLocked = isPosRoute && !posMouseUnlocked;
    document.body.classList.toggle("ht-posMouseLocked", isLocked);
    return () => {
      document.body.classList.remove("ht-posMouseLocked");
    };
  }, [isPosRoute, posMouseUnlocked]);

  const outletContext = {
    isPosRoute,
    posIntroOpen,
    posMouseUnlocked,
    setPosIntroOpen,
    setPosMouseUnlocked
  };

  return (
    <div
      className={`d-flex ht-app ${collapsed ? "ht-sidebarCollapsed" : ""} ${mobileOpen ? "ht-mobileOpen" : ""} ${
        isPosRoute && posMouseUnlocked && !posIntroOpen ? "ht-posSidebarOnly" : ""
      }`}
    >
      {mobileOpen && <div className="ht-mobileOverlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="ht-content">
        <Topbar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
        />
        {isPosRoute && posIntroOpen && (
          <div className="ht-posLockOverlay" aria-live="polite" role="status">
            <div className="ht-posLockCard">
              <div className="ht-posLockEyebrow">Keyboard-only POS mode</div>
              <h2 className="h4 mb-2">Mouse disabled for cashier safety</h2>
              <p className="text-muted mb-3">
                Use the keyboard to scan items, adjust totals, and complete sales. Press <span className="ht-kbd">Enter</span> to enter the POS screen, then use the sidebar to check stock. Press <span className="ht-kbd">Esc</span> later to unlock the rest of the interface.
              </p>
              <button
                className="btn btn-primary ht-btn ht-btnAccent w-100"
                autoFocus
                onClick={() => {
                  setPosMouseUnlocked(false);
                  setPosIntroOpen(false);
                }}
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
              </div>
            </div>
          </div>
        )}
        <main className="ht-main container-fluid">
          <div className="animate-slide-up">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>
    </div>
  );
}

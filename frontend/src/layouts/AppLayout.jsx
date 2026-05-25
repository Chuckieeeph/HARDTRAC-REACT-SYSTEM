import { Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "../shared/Sidebar.jsx";
import Topbar from "../shared/Topbar.jsx";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("hardtrac_sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("hardtrac_sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

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

  return (
    <div className={`d-flex ht-app ${collapsed ? "ht-sidebarCollapsed" : ""} ${mobileOpen ? "ht-mobileOpen" : ""}`}>
      {mobileOpen && <div className="ht-mobileOverlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <Sidebar onNavigate={() => setMobileOpen(false)} />
      <div className="ht-content">
        <Topbar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
        />
        <main className="ht-main container-fluid">
          <div className="animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

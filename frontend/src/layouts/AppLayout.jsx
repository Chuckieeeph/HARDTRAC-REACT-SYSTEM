import { Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Sidebar from "../shared/Sidebar.jsx";
import Topbar from "../shared/Topbar.jsx";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("hardtrac_sidebar") === "collapsed");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("hardtrac_sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  return (
    <div className={`d-flex ht-app ${collapsed ? "ht-sidebarCollapsed" : ""} ${mobileOpen ? "ht-mobileOpen" : ""}`}>
      <div className="ht-mobileOverlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
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

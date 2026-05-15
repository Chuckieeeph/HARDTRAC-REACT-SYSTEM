import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar.jsx";
import Topbar from "../shared/Topbar.jsx";

export default function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <main className="container-fluid py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


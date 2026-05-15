import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-bottom bg-white">
      <div className="container-fluid py-2 d-flex align-items-center justify-content-between">
        <div className="fw-semibold">Inventory & Sales System</div>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">
            {user?.fullName ? `${user.fullName} (${user.role})` : user?.username}
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}


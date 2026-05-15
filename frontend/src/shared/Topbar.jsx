import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  if (name === "sun") {
    return (
      <svg {...common}>
        <path
          d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg {...common}>
        <path
          d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

export default function Topbar({ onToggleSidebar, onToggleMobile }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="ht-topbar">
      <div className="container-fluid py-2 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <button className="ht-sidebarToggle d-lg-none" onClick={onToggleMobile} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <button className="ht-sidebarToggle d-none d-lg-inline-flex" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <Icon name="menu" />
          </button>
          <div>
            <div className="fw-semibold">HARDTRAC</div>
            <div className="small ht-muted">Inventory & POS for MVS Hardware</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm ht-btn ht-btnGhost d-inline-flex align-items-center gap-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Icon name="sun" /> : <Icon name="moon" />}
            <span className="d-none d-md-inline">{theme === "dark" ? "MVS Light" : "HARDTRAC Dark"}</span>
          </button>
          <span className="small text-muted">
            {user?.fullName ? `${user.fullName} (${user.role})` : user?.username}
          </span>
          <button className="btn btn-outline-secondary btn-sm ht-btn ht-btnGhost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

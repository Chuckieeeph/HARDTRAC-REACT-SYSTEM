import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  const stroke = { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" {...stroke} />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M21 8.5 12 3 3 8.5 12 14l9-5.5Z" {...stroke} />
          <path d="M3 8.5V16l9 5 9-5V8.5" {...stroke} />
          <path d="M12 14v7" {...stroke} />
        </svg>
      );
    case "tags":
      return (
        <svg {...common}>
          <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" {...stroke} />
          <path d="M7 7h.01" {...stroke} />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 7h11v10H3V7Z" {...stroke} />
          <path d="M14 10h4l3 3v4h-7v-7Z" {...stroke} />
          <path d="M7 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" {...stroke} />
          <path d="M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" {...stroke} />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...stroke} />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" {...stroke} />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" {...stroke} />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
        </svg>
      );
    case "inventory":
      return (
        <svg {...common}>
          <path d="M9 6h11" {...stroke} />
          <path d="M9 12h11" {...stroke} />
          <path d="M9 18h11" {...stroke} />
          <path d="M4 6h.01M4 12h.01M4 18h.01" {...stroke} />
        </svg>
      );
    case "adjust":
      return (
        <svg {...common}>
          <path d="M12 3v18" {...stroke} />
          <path d="M8 7h8" {...stroke} />
          <path d="M6 17h12" {...stroke} />
        </svg>
      );
    case "report":
      return (
        <svg {...common}>
          <path d="M4 19V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" {...stroke} />
          <path d="M14 3v6h6" {...stroke} />
          <path d="M8 13h8M8 17h6" {...stroke} />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" {...stroke} />
        </svg>
      );
    case "pos":
      return (
        <svg {...common}>
          <path d="M4 7h16" {...stroke} />
          <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" {...stroke} />
          <path d="M6 21h12a2 2 0 0 0 2-2V9H4v10a2 2 0 0 0 2 2Z" {...stroke} />
          <path d="M8 13h0M12 13h0M16 13h0M8 17h0M12 17h0M16 17h0" {...stroke} />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2Z" {...stroke} />
          <path d="M9 6h6M9 10h6M9 14h6" {...stroke} />
        </svg>
      );
    default:
      return null;
  }
}

function MenuLink({ to, label, icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `ht-navLink ${isActive ? "active" : ""}`}
    >
      <span className="ht-navIcon">
        <Icon name={icon} />
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";
  const isHeadCashier = user?.role === "head-cashier";

  return (
    <aside className="ht-sidebar">
      <div className="ht-sidebarBrand d-flex align-items-center gap-2">
        <div className="ht-brandMark" aria-hidden="true" />
        <div className="ht-brandText">
          <div className="ht-brandTitle">HARDTRAC</div>
          <div className="ht-brandSub">MVS Hardware</div>
        </div>
      </div>

      <nav className="pb-3">
        <MenuLink to="/dashboard" label="Dashboard" icon="dashboard" onNavigate={onNavigate} />

        {isAdmin && (
          <>
            <div className="ht-navSection">Admin</div>
            <MenuLink to="/admin/products" label="Products" icon="box" onNavigate={onNavigate} />
            <MenuLink to="/admin/categories" label="Categories" icon="tags" onNavigate={onNavigate} />
            <MenuLink to="/admin/suppliers" label="Suppliers" icon="truck" onNavigate={onNavigate} />
            <MenuLink to="/admin/users" label="Users" icon="users" onNavigate={onNavigate} />
            <MenuLink to="/admin/inventory" label="Inventory" icon="inventory" onNavigate={onNavigate} />
            <MenuLink to="/admin/stock-adjust" label="Stock Adjustment" icon="adjust" onNavigate={onNavigate} />
            <MenuLink to="/admin/reports/sales" label="Sales Reports" icon="report" onNavigate={onNavigate} />
            <MenuLink to="/admin/reports/low-stock" label="Low Stock" icon="report" onNavigate={onNavigate} />
            <MenuLink to="/admin/audit-logs" label="Audit Logs" icon="shield" onNavigate={onNavigate} />
            <MenuLink to="/my-transactions" label="Transactions" icon="receipt" onNavigate={onNavigate} />
          </>
        )}

        {(isCashier || isHeadCashier) && (
          <>
            <div className="ht-navSection">{isHeadCashier ? "Head Cashier" : "Cashier"}</div>
            <MenuLink to="/pos" label="POS" icon="pos" onNavigate={onNavigate} />
            <MenuLink to="/my-transactions" label="My Transactions" icon="receipt" onNavigate={onNavigate} />
            {isHeadCashier && (
              <>
                <MenuLink to="/admin/inventory" label="Inventory" icon="inventory" onNavigate={onNavigate} />
                <MenuLink to="/admin/reports/low-stock" label="Low Stock" icon="report" onNavigate={onNavigate} />
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}

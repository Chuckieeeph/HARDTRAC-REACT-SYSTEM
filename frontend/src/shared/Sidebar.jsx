import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function MenuLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `list-group-item list-group-item-action ${isActive ? "active" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside style={{ width: 260 }} className="border-end bg-white">
      <div className="p-3 border-bottom">
        <div className="fw-bold">HARDTRAC</div>
        <div className="text-muted small">MVS Hardware</div>
      </div>

      <div className="list-group list-group-flush">
        <MenuLink to="/dashboard" label="Dashboard" />

        {user?.role === "admin" && (
          <>
            <div className="px-3 pt-3 text-uppercase text-muted small">Admin</div>
            <MenuLink to="/admin/products" label="Products" />
            <MenuLink to="/admin/categories" label="Categories" />
            <MenuLink to="/admin/suppliers" label="Suppliers" />
            <MenuLink to="/admin/users" label="Users" />
            <MenuLink to="/admin/inventory" label="Inventory" />
            <MenuLink to="/admin/stock-adjust" label="Stock Adjustment" />
            <MenuLink to="/admin/reports/sales" label="Sales Reports" />
            <MenuLink to="/admin/reports/low-stock" label="Low Stock" />
            <MenuLink to="/admin/audit-logs" label="Audit Logs" />
          </>
        )}

        {user?.role === "cashier" && (
          <>
            <div className="px-3 pt-3 text-uppercase text-muted small">Cashier</div>
            <MenuLink to="/pos" label="POS" />
            <MenuLink to="/my-transactions" label="My Transactions" />
          </>
        )}
      </div>
    </aside>
  );
}


import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Role-based access control for pages.
 * - If `admin`/`cashier` props are provided, renders a role-based component (dashboard switch).
 * - Otherwise, acts as a guard for nested routes (renders <Outlet /> when allowed).
 */
export default function RoleBasedRoute({ allow, admin, cashier }) {
  const { user } = useAuth();

  if (!user?.role) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/dashboard" replace />;

  // Dashboard switch mode
  if (admin !== undefined || cashier !== undefined) {
    if (user.role === "admin") return admin ?? <Navigate to="/dashboard" replace />;
    if (user.role === "cashier" || user.role === "head-cashier") return cashier ?? <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // Guard mode
  return <Outlet />;
}

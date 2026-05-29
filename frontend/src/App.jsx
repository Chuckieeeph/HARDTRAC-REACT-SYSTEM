import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProductsPage from "./pages/admin/ProductsPage.jsx";
import ProductFormPage from "./pages/admin/ProductFormPage.jsx";
import CategoriesPage from "./pages/admin/CategoriesPage.jsx";
import SuppliersPage from "./pages/admin/SuppliersPage.jsx";
import UsersPage from "./pages/admin/UsersPage.jsx";
import InventoryPage from "./pages/admin/InventoryPage.jsx";
import StockAdjustmentPage from "./pages/admin/StockAdjustmentPage.jsx";
import SalesReportsPage from "./pages/admin/SalesReportsPage.jsx";
import LowStockReportPage from "./pages/admin/LowStockReportPage.jsx";
import AuditLogsPage from "./pages/admin/AuditLogsPage.jsx";

import CashierDashboard from "./pages/cashier/CashierDashboard.jsx";
import POSPage from "./pages/cashier/POSPage.jsx";
import MyTransactionsPage from "./pages/cashier/MyTransactionsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute
                admin={<AdminDashboard />}
                cashier={<CashierDashboard />}
              />
            }
          />

          {/* Admin routes */}
          <Route element={<RoleBasedRoute allow={["admin"]} />}>
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/products/new" element={<ProductFormPage mode="create" />} />
            <Route path="/admin/products/:id/edit" element={<ProductFormPage mode="edit" />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/suppliers" element={<SuppliersPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/stock-adjust" element={<StockAdjustmentPage />} />
            <Route path="/admin/reports/sales" element={<SalesReportsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allow={["admin", "head-cashier"]} />}>
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/reports/low-stock" element={<LowStockReportPage />} />
          </Route>

          {/* Cashier routes */}
          <Route element={<RoleBasedRoute allow={["cashier", "head-cashier", "admin"]} />}>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/my-transactions" element={<MyTransactionsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

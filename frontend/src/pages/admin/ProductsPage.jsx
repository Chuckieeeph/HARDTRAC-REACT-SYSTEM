import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";
import ConfirmModal from "../../shared/ConfirmModal.jsx";
import { money } from "../../utils/format.js";

function StockBadge({ stockStatus, currentStock, reorderLevel }) {
  const map = {
    "out-of-stock": "danger",
    "low-stock": "warning",
    "in-stock": "success"
  };
  const variant = map[stockStatus] || "secondary";
  const label =
    stockStatus === "low-stock"
      ? `Low (${currentStock} <= ${reorderLevel})`
      : stockStatus === "out-of-stock"
        ? "Out"
        : "In";

  return <span className={`badge text-bg-${variant}`}>{label}</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => products, [products]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", { params: { q: q || undefined } });
      setProducts(data.products);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function archiveProduct() {
    try {
      await api.post(`/products/${archiveTarget.id}/archive`);
      setToast({ show: true, message: "Product archived", variant: "success" });
      setArchiveTarget(null);
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Archive failed", variant: "danger" });
    }
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">Products</h4>
          <div className="text-muted small">Manage products, barcode, and RFID values</div>
        </div>
        <Link className="btn btn-primary" to="/admin/products/new">
          Add Product
        </Link>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex gap-2">
          <input
            className="form-control"
            placeholder="Search by name, SKU, barcode, or RFID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
          />
          <button className="btn btn-outline-primary" onClick={load}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">No products found.</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>RFID</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th style={{ width: 170 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>{p.sku}</td>
                    <td className="text-muted small">{p.barcode_value || "-"}</td>
                    <td className="text-muted small">{p.rfid_value || "-"}</td>
                    <td>{money(p.selling_price)}</td>
                    <td>{p.current_stock}</td>
                    <td>
                      <StockBadge
                        stockStatus={p.stock_status}
                        currentStock={p.current_stock}
                        reorderLevel={p.reorder_level}
                      />
                      {p.status === "inactive" && <span className="badge text-bg-secondary ms-2">Inactive</span>}
                    </td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-secondary me-2" to={`/admin/products/${p.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setArchiveTarget({ id: p.id, name: p.name })}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        show={Boolean(archiveTarget)}
        title="Archive Product"
        body={<div>Archive <b>{archiveTarget?.name}</b>?</div>}
        confirmText="Archive"
        onConfirm={archiveProduct}
        onClose={() => setArchiveTarget(null)}
      />

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}


import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { money } from "../../utils/format.js";

function statusBadge(p) {
  if (p.current_stock <= 0) return <span className="badge text-bg-danger">Out</span>;
  if (p.current_stock <= p.reorder_level) return <span className="badge text-bg-warning">Low</span>;
  return <span className="badge text-bg-success">In</span>;
}

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [low, setLow] = useState([]);
  const [out, setOut] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, l, o, m] = await Promise.all([
        api.get("/products"),
        api.get("/inventory/low-stock"),
        api.get("/inventory/out-of-stock"),
        api.get("/inventory/movements")
      ]);
      setProducts(p.data.products);
      setLow(l.data.products);
      setOut(o.data.products);
      setMovements(m.data.movements.slice(0, 20));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">Inventory</h4>
          <div className="text-muted small">Low-stock and out-of-stock are highlighted</div>
        </div>
        <button className="btn btn-outline-secondary" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="fw-semibold mb-2">Low Stock</div>
              {low.length === 0 ? (
                <div className="text-muted small">None</div>
              ) : (
                <ul className="mb-0">
                  {low.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      {p.name} ({p.current_stock} ≤ {p.reorder_level})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="fw-semibold mb-2">Out of Stock</div>
              {out.length === 0 ? (
                <div className="text-muted small">None</div>
              ) : (
                <ul className="mb-0">
                  {out.slice(0, 8).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="fw-semibold mb-2">Products Stock</div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Reorder</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={p.current_stock <= 0 ? "table-danger" : p.current_stock <= p.reorder_level ? "table-warning" : ""}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{money(p.selling_price)}</td>
                    <td>{p.current_stock}</td>
                    <td>{p.reorder_level}</td>
                    <td>{statusBadge(p)}</td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="fw-semibold mb-2">Recent Stock Movements</div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty Change</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="text-muted small">{new Date(m.created_at).toLocaleString()}</td>
                    <td>{m.product_name}</td>
                    <td>{m.movement_type}</td>
                    <td className={m.qty_change < 0 ? "text-danger fw-semibold" : "text-success fw-semibold"}>{m.qty_change}</td>
                    <td className="text-muted small">{m.reason || "-"}</td>
                    <td className="text-muted small">{m.performed_by_username || "-"}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No movements.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}


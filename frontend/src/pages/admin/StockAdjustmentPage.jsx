import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";

export default function StockAdjustmentPage() {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [form, setForm] = useState({ productId: "", adjustmentType: "add", quantity: 1, reason: "" });

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    async function load() {
      const { data } = await api.get("/products");
      setProducts(data.products);
    }
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/inventory/adjust", {
        productId: Number(form.productId),
        adjustmentType: form.adjustmentType,
        quantity: Number(form.quantity),
        reason: form.reason.trim()
      });
      setToast({ show: true, message: "Stock updated", variant: "success" });
      setForm({ productId: "", adjustmentType: "add", quantity: 1, reason: "" });
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  return (
    <>
      <h4 className="mb-3">Stock Adjustment</h4>
      <div className="card shadow-sm">
        <div className="card-body">
          <form className="row g-3" onSubmit={submit}>
            <div className="col-md-6">
              <label className="form-label">Product</label>
              <select className="form-select" value={form.productId} onChange={(e) => setField("productId", e.target.value)} required>
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.current_stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.adjustmentType} onChange={(e) => setField("adjustmentType", e.target.value)}>
                <option value="add">Add Stock</option>
                <option value="subtract">Subtract Stock</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Quantity</label>
              <input className="form-control" type="number" min="1" value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} required />
            </div>
            <div className="col-md-12">
              <label className="form-label">Reason</label>
              <input className="form-control" value={form.reason} onChange={(e) => setField("reason", e.target.value)} placeholder="e.g., New delivery, Damaged item, Stock count correction" required />
            </div>
            <div className="col-md-12">
              <button className="btn btn-primary">Apply</button>
            </div>
          </form>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}


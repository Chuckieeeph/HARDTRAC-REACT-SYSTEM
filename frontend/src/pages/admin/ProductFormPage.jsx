import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";

export default function ProductFormPage({ mode }) {
  const navigate = useNavigate();
  const params = useParams();
  const productId = useMemo(() => Number(params.id), [params.id]);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    sku: "",
    barcodeValue: "",
    rfidValue: "",
    description: "",
    unit: "",
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    reorderLevel: 0,
    status: "active"
  });

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    async function loadRefs() {
      const [c, s] = await Promise.all([api.get("/categories"), api.get("/suppliers")]);
      setCategories(c.data.categories);
      setSuppliers(s.data.suppliers);
    }
    loadRefs();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (mode !== "edit") return;
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${productId}`);
        const p = data.product;
        setForm({
          name: p.name,
          categoryId: p.category_id || "",
          supplierId: p.supplier_id || "",
          sku: p.sku,
          barcodeValue: p.barcode_value || "",
          rfidValue: p.rfid_value || "",
          description: p.description || "",
          unit: p.unit || "",
          costPrice: Number(p.cost_price),
          sellingPrice: Number(p.selling_price),
          currentStock: Number(p.current_stock),
          reorderLevel: Number(p.reorder_level),
          status: p.status
        });
      } catch (err) {
        setToast({ show: true, message: err?.response?.data?.message || "Failed to load product", variant: "danger" });
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [mode, productId]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        sku: form.sku.trim(),
        barcodeValue: form.barcodeValue.trim() || null,
        rfidValue: form.rfidValue.trim() || null,
        description: form.description.trim() || null,
        unit: form.unit.trim() || null,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        currentStock: Number(form.currentStock),
        reorderLevel: Number(form.reorderLevel),
        status: form.status
      };

      if (mode === "create") {
        await api.post("/products", payload);
      } else {
        // Stock is handled via Inventory/Stock Adjustment, but we allow initial stock to display.
        const { currentStock, ...rest } = payload;
        await api.patch(`/products/${productId}`, rest);
      }
      setToast({ show: true, message: "Saved", variant: "success" });
      navigate("/admin/products");
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Save failed", variant: "danger" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-0">{mode === "create" ? "Add Product" : "Edit Product"}</h4>
          <div className="text-muted small">Barcode and RFID values must be unique</div>
        </div>
        <Link to="/admin/products" className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={save}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">SKU</label>
                  <input className="form-control" value={form.sku} onChange={(e) => setField("sku", e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.categoryId} onChange={(e) => setField("categoryId", e.target.value)}>
                    <option value="">(None)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Supplier</label>
                  <select className="form-select" value={form.supplierId} onChange={(e) => setField("supplierId", e.target.value)}>
                    <option value="">(None)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Unit</label>
                  <input className="form-control" value={form.unit} onChange={(e) => setField("unit", e.target.value)} placeholder="pc, box, roll..." />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Barcode Value</label>
                  <input className="form-control" value={form.barcodeValue} onChange={(e) => setField("barcodeValue", e.target.value)} placeholder="Scan or type barcode" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">RFID Tag Value</label>
                  <input className="form-control" value={form.rfidValue} onChange={(e) => setField("rfidValue", e.target.value)} placeholder="Scan or type RFID" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setField("description", e.target.value)} />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Cost Price</label>
                  <input className="form-control" type="number" step="0.01" value={form.costPrice} onChange={(e) => setField("costPrice", e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Selling Price</label>
                  <input className="form-control" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setField("sellingPrice", e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Reorder Level</label>
                  <input className="form-control" type="number" value={form.reorderLevel} onChange={(e) => setField("reorderLevel", e.target.value)} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Current Stock</label>
                  <input className="form-control" type="number" value={form.currentStock} onChange={(e) => setField("currentStock", e.target.value)} disabled={mode === "edit"} />
                  {mode === "edit" && <div className="text-muted small mt-1">Use Stock Adjustment to change stock</div>}
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <Link to="/admin/products" className="btn btn-outline-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}


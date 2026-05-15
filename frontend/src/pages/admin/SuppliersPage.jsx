import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [form, setForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "" });

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function load() {
    const { data } = await api.get("/suppliers");
    setSuppliers(data.suppliers);
  }

  useEffect(() => {
    load();
  }, []);

  async function addSupplier(e) {
    e.preventDefault();
    try {
      await api.post("/suppliers", { ...form, name: form.name.trim() });
      setForm({ name: "", contactPerson: "", phone: "", email: "", address: "" });
      setToast({ show: true, message: "Supplier added", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  async function deleteSupplier(id) {
    if (!confirm("Delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setToast({ show: true, message: "Deleted", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  return (
    <>
      <h4 className="mb-3">Suppliers</h4>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2" onSubmit={addSupplier}>
            <div className="col-md-4">
              <input className="form-control" placeholder="Supplier name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Contact person" value={form.contactPerson} onChange={(e) => setField("contactPerson", e.target.value)} />
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="col-md-9">
              <input className="form-control" placeholder="Address" value={form.address} onChange={(e) => setField("address", e.target.value)} />
            </div>
            <div className="col-md-3 d-grid">
              <button className="btn btn-primary">Add Supplier</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.name}</td>
                  <td>{s.contact_person || "-"}</td>
                  <td>{s.phone || "-"}</td>
                  <td>{s.email || "-"}</td>
                  <td className="text-muted small">{s.address || "-"}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSupplier(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No suppliers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast show={toast.show} message={toast.message} variant={toast.variant} onClose={() => setToast({ ...toast, show: false })} />
    </>
  );
}


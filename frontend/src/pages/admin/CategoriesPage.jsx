import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  async function load() {
    const { data } = await api.get("/categories");
    setCategories(data.categories);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    try {
      await api.post("/categories", { name: name.trim() });
      setName("");
      setToast({ show: true, message: "Category added", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  async function renameCategory(id, newName) {
    try {
      await api.patch(`/categories/${id}`, { name: newName.trim() });
      setToast({ show: true, message: "Updated", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setToast({ show: true, message: "Deleted", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  return (
    <>
      <h4 className="mb-3">Categories</h4>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="d-flex gap-2" onSubmit={addCategory}>
            <input className="form-control" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn btn-primary">Add</button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ width: 160 }} />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      defaultValue={c.name}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v && v !== c.name) renameCategory(c.id, v);
                      }}
                    />
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-4">
                    No categories.
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


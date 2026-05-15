import React, { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import Toast from "../../shared/Toast.jsx";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [form, setForm] = useState({ username: "", password: "", role: "cashier", fullName: "" });

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function load() {
    const { data } = await api.get("/users");
    setUsers(data.users);
  }

  useEffect(() => {
    load();
  }, []);

  async function addUser(e) {
    e.preventDefault();
    try {
      await api.post("/users", {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        fullName: form.fullName.trim()
      });
      setForm({ username: "", password: "", role: "cashier", fullName: "" });
      setToast({ show: true, message: "User created", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  async function updateUser(id, patch) {
    try {
      await api.patch(`/users/${id}`, patch);
      setToast({ show: true, message: "Updated", variant: "success" });
      await load();
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  async function resetPassword(id) {
    const password = prompt("Enter new password (min 6 chars):");
    if (!password) return;
    try {
      await api.post(`/users/${id}/reset-password`, { password });
      setToast({ show: true, message: "Password reset", variant: "success" });
    } catch (err) {
      setToast({ show: true, message: err?.response?.data?.message || "Failed", variant: "danger" });
    }
  }

  return (
    <>
      <h4 className="mb-3">Users / Cashiers</h4>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form className="row g-2" onSubmit={addUser}>
            <div className="col-md-3">
              <input className="form-control" placeholder="Username" value={form.username} onChange={(e) => setField("username", e.target.value)} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Full name" value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} required />
            </div>
            <div className="col-md-2">
              <select className="form-select" value={form.role} onChange={(e) => setField("role", e.target.value)}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-2">
              <input className="form-control" type="password" placeholder="Password" value={form.password} onChange={(e) => setField("password", e.target.value)} required />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: 160 }} />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>
                    <select className="form-select form-select-sm" value={u.role} onChange={(e) => updateUser(u.id, { role: e.target.value })}>
                      <option value="admin">Admin</option>
                      <option value="cashier">Cashier</option>
                    </select>
                  </td>
                  <td>
                    <select className="form-select form-select-sm" value={u.status} onChange={(e) => updateUser(u.id, { status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => resetPassword(u.id)}>
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No users.
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


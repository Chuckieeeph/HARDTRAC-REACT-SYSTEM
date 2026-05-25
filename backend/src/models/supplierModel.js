import { db } from "../config/db.js";

export async function listSuppliers() {
  const [rows] = await db.query(
    "SELECT id, name, contact_person, phone, email, address, created_at, updated_at FROM suppliers ORDER BY name ASC"
  );
  return rows;
}

export async function createSupplier({ name, contactPerson, phone, email, address }) {
  const [result] = await db.query(
    "INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)",
    [name, contactPerson || null, phone || null, email || null, address || null]
  );
  const [rows] = await db.query(
    "SELECT id, name, contact_person, phone, email, address, created_at, updated_at FROM suppliers WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

export async function updateSupplier(id, { name, contactPerson, phone, email, address }) {
  await db.query(
    "UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ?",
    [name, contactPerson || null, phone || null, email || null, address || null, id]
  );
  const [rows] = await db.query(
    "SELECT id, name, contact_person, phone, email, address, created_at, updated_at FROM suppliers WHERE id = ?",
    [id]
  );
  return rows[0];
}

export async function deleteSupplier(id) {
  await db.query("DELETE FROM suppliers WHERE id = ?", [id]);
}


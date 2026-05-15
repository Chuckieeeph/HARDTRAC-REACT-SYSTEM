import { db } from "../config/db.js";

export async function listCategories() {
  const [rows] = await db.query("SELECT id, name, created_at, updated_at FROM categories ORDER BY name ASC");
  return rows;
}

export async function createCategory({ name }) {
  const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
  const [rows] = await db.query("SELECT id, name, created_at, updated_at FROM categories WHERE id = ?", [
    result.insertId
  ]);
  return rows[0];
}

export async function updateCategory(id, { name }) {
  await db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
  const [rows] = await db.query("SELECT id, name, created_at, updated_at FROM categories WHERE id = ?", [id]);
  return rows[0];
}

export async function deleteCategory(id) {
  await db.query("DELETE FROM categories WHERE id = ?", [id]);
}


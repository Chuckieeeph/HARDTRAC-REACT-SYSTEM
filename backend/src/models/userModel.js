import { db } from "../config/db.js";

export async function getUserByUsername(username) {
  const [rows] = await db.query(
    "SELECT id, username, password_hash, role, full_name, status, created_at, updated_at FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
}

export async function getUserById(id) {
  const [rows] = await db.query(
    "SELECT id, username, role, full_name, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function listUsers() {
  const [rows] = await db.query(
    "SELECT id, username, role, full_name, status, created_at, updated_at FROM users ORDER BY id DESC"
  );
  return rows;
}

export async function createUser({ username, passwordHash, role, fullName }) {
  const [result] = await db.query(
    "INSERT INTO users (username, password_hash, role, full_name, status) VALUES (?, ?, ?, ?, 'active')",
    [username, passwordHash, role, fullName]
  );
  return getUserById(result.insertId);
}

export async function updateUser(id, { role, fullName, status }) {
  await db.query(
    "UPDATE users SET role = COALESCE(?, role), full_name = COALESCE(?, full_name), status = COALESCE(?, status) WHERE id = ?",
    [role ?? null, fullName ?? null, status ?? null, id]
  );
  return getUserById(id);
}

export async function resetUserPassword(id, passwordHash) {
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}


import { db } from "../config/db.js";

export async function ensureUserRfidSchema() {
  const [columns] = await db.query("SHOW COLUMNS FROM users");
  const columnNames = new Set(columns.map((column) => column.Field));

  if (!columnNames.has("rfid_value")) {
    await db.query("ALTER TABLE users ADD COLUMN rfid_value VARCHAR(80) NULL AFTER full_name");
  }

  const [createRows] = await db.query("SHOW CREATE TABLE users");
  const createStatement = createRows[0]?.["Create Table"] || "";
  if (!createStatement.includes("uq_users_rfid")) {
    try {
      await db.query("ALTER TABLE users ADD UNIQUE KEY uq_users_rfid (rfid_value)");
    } catch (err) {
      if (err?.code !== "ER_DUP_ENTRY" && err?.errno !== 1062) {
        throw err;
      }
    }
  }
}

export async function syncDemoUserRfidValues() {
  await db.query(
    "UPDATE users SET rfid_value = ? WHERE username = ? OR full_name = ?",
    ["0805615836", "admin", "System Admin"]
  );
  await db.query(
    "UPDATE users SET rfid_value = ? WHERE username = ? OR full_name = ?",
    ["0807110236", "cashier", "Default Cashier"]
  );
  await db.query(
    "UPDATE users SET rfid_value = ? WHERE username = ? OR username = ? OR full_name = ?",
    ["0805666812", "cashier2", "Cashier 2", "Eleah Camille"]
  );
  await db.query(
    "UPDATE users SET rfid_value = ? WHERE username = ? OR full_name = ?",
    ["0807793948", "headcashier", "Head Cashier"]
  );
}

export async function getUserByUsername(username) {
  const [rows] = await db.query(
    "SELECT id, username, password_hash, role, full_name, rfid_value, status, created_at, updated_at FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
}

export async function getUserByRfid(rfidValue) {
  const [rows] = await db.query(
    "SELECT id, username, password_hash, role, full_name, rfid_value, status, created_at, updated_at FROM users WHERE rfid_value = ? LIMIT 1",
    [rfidValue]
  );
  return rows[0] || null;
}

export async function getUserById(id) {
  const [rows] = await db.query(
    "SELECT id, username, role, full_name, rfid_value, status, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

export async function listUsers() {
  const [rows] = await db.query(
    "SELECT id, username, role, full_name, rfid_value, status, created_at, updated_at FROM users ORDER BY id DESC"
  );
  return rows;
}

export async function createUser({ username, passwordHash, role, fullName, rfidValue = null }) {
  const [result] = await db.query(
    "INSERT INTO users (username, password_hash, role, full_name, rfid_value, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [username, passwordHash, role, fullName, rfidValue]
  );
  return getUserById(result.insertId);
}

export async function updateUser(id, { role, fullName, rfidValue, status }) {
  const updates = [];
  const params = [];

  if (role !== undefined) {
    updates.push("role = ?");
    params.push(role);
  }
  if (fullName !== undefined) {
    updates.push("full_name = ?");
    params.push(fullName);
  }
  if (rfidValue !== undefined) {
    updates.push("rfid_value = ?");
    params.push(rfidValue);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    params.push(status);
  }

  if (!updates.length) return getUserById(id);

  params.push(id);
  await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  return getUserById(id);
}

export async function resetUserPassword(id, passwordHash) {
  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

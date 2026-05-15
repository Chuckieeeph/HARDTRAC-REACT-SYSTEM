import { db } from "../config/db.js";

export async function addAuditLog({ userId, action, entityType, entityId, details }) {
  await db.query(
    `
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
    `,
    [userId || null, action, entityType, entityId || null, details ? JSON.stringify(details) : null]
  );
}

export async function listAuditLogs({ from, to, userId } = {}) {
  const where = [];
  const params = [];

  if (from) {
    where.push("al.created_at >= ?");
    params.push(from);
  }
  if (to) {
    where.push("al.created_at <= ?");
    params.push(to);
  }
  if (userId) {
    where.push("al.user_id = ?");
    params.push(userId);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `
    SELECT al.*, u.username
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ${sqlWhere}
    ORDER BY al.id DESC
    LIMIT 500
    `,
    params
  );
  return rows;
}


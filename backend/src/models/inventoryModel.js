import { db } from "../config/db.js";

export async function listMovements({ from, to, productId } = {}) {
  const where = [];
  const params = [];

  if (from) {
    where.push("im.created_at >= ?");
    params.push(from);
  }
  if (to) {
    where.push("im.created_at <= ?");
    params.push(to);
  }
  if (productId) {
    where.push("im.product_id = ?");
    params.push(productId);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT im.*, p.name AS product_name, u.username AS performed_by_username
    FROM inventory_movements im
    JOIN products p ON p.id = im.product_id
    LEFT JOIN users u ON u.id = im.performed_by
    ${sqlWhere}
    ORDER BY im.id DESC
    `,
    params
  );
  return rows;
}

export async function addMovement(connection, movement) {
  const { productId, type, qtyChange, reason, referenceType, referenceId, performedBy } = movement;
  await connection.query(
    `
    INSERT INTO inventory_movements
      (product_id, movement_type, qty_change, reason, reference_type, reference_id, performed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [productId, type, qtyChange, reason || null, referenceType || null, referenceId || null, performedBy || null]
  );
}

export async function getLowStockProducts() {
  const [rows] = await db.query(
    `
    SELECT p.*
    FROM products p
    WHERE p.status = 'active'
      AND p.current_stock > 0
      AND p.current_stock <= p.reorder_level
    ORDER BY p.current_stock ASC
    `
  );
  return rows;
}

export async function getOutOfStockProducts() {
  const [rows] = await db.query(
    `
    SELECT p.*
    FROM products p
    WHERE p.status = 'active'
      AND p.current_stock <= 0
    ORDER BY p.id DESC
    `
  );
  return rows;
}


import { db } from "../config/db.js";

function normalizeDateTimeBounds({ from, to } = {}) {
  const isDateOnly = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const out = { from, to };
  if (isDateOnly(from)) out.from = `${from} 00:00:00`;
  if (isDateOnly(to)) out.to = `${to} 23:59:59`;
  return out;
}

export async function getAdminDashboardSummary() {
  const [[products]] = await db.query(
    `
    SELECT
      COUNT(*) AS total_products,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_products
    FROM products
    `
  );

  const [[lowStock]] = await db.query(
    `
    SELECT COUNT(*) AS low_stock_count
    FROM products
    WHERE status = 'active'
      AND current_stock > 0
      AND current_stock <= reorder_level
    `
  );

  const [[outStock]] = await db.query(
    `
    SELECT COUNT(*) AS out_of_stock_count
    FROM products
    WHERE status = 'active'
      AND current_stock <= 0
    `
  );

  const [[todaySales]] = await db.query(
    `
    SELECT
      COUNT(*) AS today_transactions,
      COALESCE(SUM(total_amount), 0) AS today_sales
    FROM sales
    WHERE DATE(created_at) = CURDATE()
    `
  );

  return {
    ...products,
    ...lowStock,
    ...outStock,
    ...todaySales
  };
}

export async function getCashierDashboardSummary(cashierId) {
  const [[today]] = await db.query(
    `
    SELECT
      COUNT(*) AS today_transactions,
      COALESCE(SUM(total_amount), 0) AS today_sales
    FROM sales
    WHERE cashier_id = ?
      AND DATE(created_at) = CURDATE()
    `,
    [cashierId]
  );
  return today;
}

export async function getSalesSummary({ from, to } = {}) {
  ({ from, to } = normalizeDateTimeBounds({ from, to }));
  const where = [];
  const params = [];

  if (from) {
    where.push("created_at >= ?");
    params.push(from);
  }
  if (to) {
    where.push("created_at <= ?");
    params.push(to);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `
    SELECT
      COUNT(*) AS total_transactions,
      COALESCE(SUM(total_amount), 0) AS total_sales
    FROM sales
    ${sqlWhere}
    `,
    params
  );
  return rows[0];
}

export async function getBestSellers({ from, to, limit = 10 } = {}) {
  ({ from, to } = normalizeDateTimeBounds({ from, to }));
  const where = [];
  const params = [];

  if (from) {
    where.push("s.created_at >= ?");
    params.push(from);
  }
  if (to) {
    where.push("s.created_at <= ?");
    params.push(to);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(Number(limit));

  const [rows] = await db.query(
    `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      SUM(si.qty) AS qty_sold,
      SUM(si.line_total) AS gross_sales
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id
    ${sqlWhere}
    GROUP BY p.id, p.name
    ORDER BY qty_sold DESC
    LIMIT ?
    `,
    params
  );
  return rows;
}

export async function getCashierPerformance({ from, to } = {}) {
  ({ from, to } = normalizeDateTimeBounds({ from, to }));

  const where = ["u.role = 'cashier'"];
  const params = [];
  const joinWhere = [];

  if (from) {
    joinWhere.push("s.created_at >= ?");
    params.push(from);
  }
  if (to) {
    joinWhere.push("s.created_at <= ?");
    params.push(to);
  }

  const sqlWhere = `WHERE ${where.join(" AND ")}`;
  const sqlJoinWhere = joinWhere.length ? `AND ${joinWhere.join(" AND ")}` : "";
  const [rows] = await db.query(
    `
    SELECT
      u.id AS cashier_id,
      u.username,
      u.full_name,
      COUNT(s.id) AS total_transactions,
      COALESCE(SUM(s.total_amount), 0) AS total_sales
    FROM users u
    LEFT JOIN sales s ON s.cashier_id = u.id ${sqlJoinWhere}
    ${sqlWhere}
    GROUP BY u.id, u.username, u.full_name
    ORDER BY total_sales DESC
    `,
    params
  );
  return rows;
}

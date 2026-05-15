import { db } from "../config/db.js";

export async function createSale({ cashierId, subtotal, discountAmount, totalAmount, cashReceived, changeAmount, items }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [saleResult] = await connection.query(
      `
      INSERT INTO sales
        (cashier_id, subtotal, discount_amount, total_amount, cash_received, change_amount)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [cashierId, subtotal, discountAmount, totalAmount, cashReceived, changeAmount]
    );
    const saleId = saleResult.insertId;

    for (const item of items) {
      const [productRows] = await connection.query(
        "SELECT id, name, current_stock, selling_price FROM products WHERE id = ? FOR UPDATE",
        [item.productId]
      );
      const product = productRows[0];
      if (!product) {
        const err = new Error("Product not found");
        err.statusCode = 400;
        err.expose = true;
        throw err;
      }

      if (item.qty <= 0) {
        const err = new Error("Invalid quantity");
        err.statusCode = 400;
        err.expose = true;
        throw err;
      }

      if (product.current_stock < item.qty) {
        const err = new Error(`Insufficient stock for ${product.name}`);
        err.statusCode = 400;
        err.expose = true;
        throw err;
      }

      const unitPrice = Number(item.unitPrice ?? product.selling_price);
      const lineTotal = unitPrice * item.qty;

      await connection.query(
        `
        INSERT INTO sale_items
          (sale_id, product_id, qty, unit_price, line_total)
        VALUES (?, ?, ?, ?, ?)
        `,
        [saleId, product.id, item.qty, unitPrice, lineTotal]
      );

      await connection.query("UPDATE products SET current_stock = current_stock - ? WHERE id = ?", [item.qty, product.id]);

      await connection.query(
        `
        INSERT INTO inventory_movements
          (product_id, movement_type, qty_change, reason, reference_type, reference_id, performed_by)
        VALUES (?, 'sale', ?, 'Sale deduction', 'sale', ?, ?)
        `,
        [product.id, -item.qty, saleId, cashierId]
      );
    }

    await connection.commit();

    const [saleRows] = await db.query(
      `
      SELECT s.*, u.username AS cashier_username, u.full_name AS cashier_name
      FROM sales s
      LEFT JOIN users u ON u.id = s.cashier_id
      WHERE s.id = ?
      `,
      [saleId]
    );
    const [itemRows] = await db.query(
      `
      SELECT si.*, p.name AS product_name, p.sku, p.barcode_value, p.rfid_value
      FROM sale_items si
      JOIN products p ON p.id = si.product_id
      WHERE si.sale_id = ?
      ORDER BY si.id ASC
      `,
      [saleId]
    );

    return { sale: saleRows[0], items: itemRows };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function listSales({ from, to, cashierId } = {}) {
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
  if (cashierId) {
    where.push("s.cashier_id = ?");
    params.push(cashierId);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT s.*, u.username AS cashier_username, u.full_name AS cashier_name
    FROM sales s
    LEFT JOIN users u ON u.id = s.cashier_id
    ${sqlWhere}
    ORDER BY s.id DESC
    `,
    params
  );
  return rows;
}

export async function getSaleById(saleId) {
  const [saleRows] = await db.query(
    `
    SELECT s.*, u.username AS cashier_username, u.full_name AS cashier_name
    FROM sales s
    LEFT JOIN users u ON u.id = s.cashier_id
    WHERE s.id = ?
    LIMIT 1
    `,
    [saleId]
  );
  const sale = saleRows[0] || null;
  if (!sale) return null;

  const [itemRows] = await db.query(
    `
    SELECT si.*, p.name AS product_name, p.sku, p.barcode_value, p.rfid_value
    FROM sale_items si
    JOIN products p ON p.id = si.product_id
    WHERE si.sale_id = ?
    ORDER BY si.id ASC
    `,
    [saleId]
  );

  return { sale, items: itemRows };
}


import { db } from "../config/db.js";

export async function listProducts({ q, status } = {}) {
  const where = [];
  const params = [];

  if (q) {
    where.push(
      "(p.name LIKE ? OR p.sku LIKE ? OR p.barcode_value = ? OR p.rfid_value = ?)"
    );
    params.push(`%${q}%`, `%${q}%`, q, q);
  }

  if (status && ["active", "inactive"].includes(status)) {
    where.push("p.status = ?");
    params.push(status);
  }

  const sqlWhere = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      p.*,
      c.name AS category_name,
      s.name AS supplier_name,
      CASE
        WHEN p.current_stock <= 0 THEN 'out-of-stock'
        WHEN p.current_stock <= p.reorder_level THEN 'low-stock'
        ELSE 'in-stock'
      END AS stock_status
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    ${sqlWhere}
    ORDER BY p.id DESC
    `,
    params
  );
  return rows;
}

export async function getProductById(id) {
  const [rows] = await db.query(
    `
    SELECT
      p.*,
      c.name AS category_name,
      s.name AS supplier_name,
      CASE
        WHEN p.current_stock <= 0 THEN 'out-of-stock'
        WHEN p.current_stock <= p.reorder_level THEN 'low-stock'
        ELSE 'in-stock'
      END AS stock_status
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    WHERE p.id = ?
    LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
}

export async function getProductByCode(code) {
  const [rows] = await db.query(
    `
    SELECT p.*
    FROM products p
    WHERE p.status = 'active'
      AND (p.barcode_value = ? OR p.rfid_value = ? OR p.sku = ?)
    LIMIT 1
    `,
    [code, code, code]
  );
  return rows[0] || null;
}

export async function createProduct(product) {
  const {
    name,
    categoryId,
    supplierId,
    sku,
    barcodeValue,
    rfidValue,
    description,
    unit,
    costPrice,
    sellingPrice,
    currentStock,
    reorderLevel,
    status
  } = product;

  const [result] = await db.query(
    `
    INSERT INTO products
      (name, category_id, supplier_id, sku, barcode_value, rfid_value, description, unit, cost_price, selling_price, current_stock, reorder_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      name,
      categoryId || null,
      supplierId || null,
      sku,
      barcodeValue || null,
      rfidValue || null,
      description || null,
      unit || null,
      costPrice,
      sellingPrice,
      currentStock,
      reorderLevel,
      status
    ]
  );
  return getProductById(result.insertId);
}

export async function updateProduct(id, product) {
  const {
    name,
    categoryId,
    supplierId,
    sku,
    barcodeValue,
    rfidValue,
    description,
    unit,
    costPrice,
    sellingPrice,
    reorderLevel,
    status
  } = product;

  await db.query(
    `
    UPDATE products
    SET
      name = ?,
      category_id = ?,
      supplier_id = ?,
      sku = ?,
      barcode_value = ?,
      rfid_value = ?,
      description = ?,
      unit = ?,
      cost_price = ?,
      selling_price = ?,
      reorder_level = ?,
      status = ?
    WHERE id = ?
    `,
    [
      name,
      categoryId || null,
      supplierId || null,
      sku,
      barcodeValue || null,
      rfidValue || null,
      description || null,
      unit || null,
      costPrice,
      sellingPrice,
      reorderLevel,
      status,
      id
    ]
  );

  return getProductById(id);
}

export async function archiveProduct(id) {
  await db.query("UPDATE products SET status = 'inactive' WHERE id = ?", [id]);
  return getProductById(id);
}

export async function setProductStock(connection, productId, newStock) {
  await connection.query("UPDATE products SET current_stock = ? WHERE id = ?", [newStock, productId]);
}


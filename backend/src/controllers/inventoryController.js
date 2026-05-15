import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { db } from "../config/db.js";
import { addAuditLog } from "../models/auditModel.js";
import { getProductById } from "../models/productModel.js";
import { addMovement, getLowStockProducts, getOutOfStockProducts, listMovements } from "../models/inventoryModel.js";

export const getLowStock = asyncHandler(async (req, res) => {
  const products = await getLowStockProducts();
  return res.json({ products });
});

export const getOutOfStock = asyncHandler(async (req, res) => {
  const products = await getOutOfStockProducts();
  return res.json({ products });
});

export const getMovements = asyncHandler(async (req, res) => {
  const movements = await listMovements(req.validated.query);
  return res.json({ movements });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { productId, adjustmentType, quantity, reason } = req.validated.body;

  const product = await getProductById(productId);
  if (!product) throw httpError(404, "Product not found");

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) throw httpError(400, "Invalid quantity");

  const change = adjustmentType === "add" ? qty : -qty;
  const newStock = Number(product.current_stock) + change;
  if (newStock < 0) throw httpError(400, "Stock cannot go negative");

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("UPDATE products SET current_stock = ? WHERE id = ?", [newStock, productId]);
    await addMovement(connection, {
      productId,
      type: adjustmentType === "add" ? "manual_add" : "adjustment",
      qtyChange: change,
      reason,
      referenceType: "manual",
      referenceId: null,
      performedBy: req.user.id
    });
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  await addAuditLog({
    userId: req.user.id,
    action: "stock_adjustment",
    entityType: "product",
    entityId: productId,
    details: { adjustmentType, quantity: qty, reason }
  });

  const updated = await getProductById(productId);
  return res.json({ product: updated });
});


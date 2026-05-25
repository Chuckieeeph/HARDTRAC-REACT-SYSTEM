import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { addAuditLog } from "../models/auditModel.js";
import { createSale, getSaleById, listSales } from "../models/salesModel.js";

export const createNewSale = asyncHandler(async (req, res) => {
  const { items, discountAmount, cashReceived } = req.validated.body;

  if (!items?.length) throw httpError(400, "Cart is empty");

  const subtotal = items.reduce((sum, it) => sum + Number(it.unitPrice) * Number(it.qty), 0);
  const discount = Number(discountAmount || 0);
  const total = Math.max(0, subtotal - discount);
  const cash = Number(cashReceived || 0);
  if (cash < total) throw httpError(400, "Insufficient cash received");
  const change = cash - total;

  const result = await createSale({
    cashierId: req.user.id,
    subtotal,
    discountAmount: discount,
    totalAmount: total,
    cashReceived: cash,
    changeAmount: change,
    items: items.map((i) => ({
      productId: Number(i.productId),
      qty: Number(i.qty),
      unitPrice: Number(i.unitPrice)
    }))
  });

  await addAuditLog({ userId: req.user.id, action: "sale_created", entityType: "sale", entityId: result.sale.id });

  return res.status(201).json(result);
});

export const getSales = asyncHandler(async (req, res) => {
  const query = { ...req.validated.query };
  if (req.user.role === "cashier") {
    query.cashierId = req.user.id;
  }
  const sales = await listSales(query);
  return res.json({ sales });
});

export const getSale = asyncHandler(async (req, res) => {
  const saleId = Number(req.params.id);
  const data = await getSaleById(saleId);
  if (!data) throw httpError(404, "Sale not found");
  if (req.user.role === "cashier" && data.sale.cashier_id !== req.user.id) {
    throw httpError(403, "Forbidden");
  }
  return res.json(data);
});

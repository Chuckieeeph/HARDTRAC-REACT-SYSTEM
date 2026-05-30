import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { addAuditLog } from "../models/auditModel.js";
import { createSale, getSaleById, listSales, voidSale } from "../models/salesModel.js";
import { getUserById } from "../models/userModel.js";

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

export const voidExistingSale = asyncHandler(async (req, res) => {
  const saleId = Number(req.params.id);
  const reason = req.validated.body.reason || "Sale voided";
  const approvalRfid = req.validated.body.approvalRfid;

  const approver = await getUserById(req.user.id);
  if (!approver || approver.status !== "active") {
    throw httpError(401, "Unauthorized");
  }
  if (!approver.rfid_value) {
    throw httpError(400, "RFID is not configured for this account");
  }
  if (approver.rfid_value !== approvalRfid) {
    throw httpError(403, "RFID approval did not match the signed-in user");
  }

  const data = await voidSale({
    saleId,
    voidedBy: req.user.id,
    reason
  });

  await addAuditLog({
    userId: req.user.id,
    action: "sale_voided",
    entityType: "sale",
    entityId: saleId,
    details: { reason, approvedByRfid: true }
  });

  return res.json(data);
});

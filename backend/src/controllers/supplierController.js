import { asyncHandler } from "../utils/asyncHandler.js";
import { addAuditLog } from "../models/auditModel.js";
import { createSupplier, deleteSupplier, listSuppliers, updateSupplier } from "../models/supplierModel.js";

export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await listSuppliers();
  return res.json({ suppliers });
});

export const createNewSupplier = asyncHandler(async (req, res) => {
  const supplier = await createSupplier(req.validated.body);
  await addAuditLog({
    userId: req.user.id,
    action: "create",
    entityType: "supplier",
    entityId: supplier.id,
    details: supplier
  });
  return res.status(201).json({ supplier });
});

export const updateExistingSupplier = asyncHandler(async (req, res) => {
  const supplier = await updateSupplier(Number(req.params.id), req.validated.body);
  await addAuditLog({
    userId: req.user.id,
    action: "update",
    entityType: "supplier",
    entityId: supplier.id,
    details: supplier
  });
  return res.json({ supplier });
});

export const deleteExistingSupplier = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await deleteSupplier(id);
  await addAuditLog({ userId: req.user.id, action: "delete", entityType: "supplier", entityId: id });
  return res.json({ ok: true });
});


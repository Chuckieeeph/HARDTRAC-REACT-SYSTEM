import { asyncHandler } from "../utils/asyncHandler.js";
import { addAuditLog } from "../models/auditModel.js";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../models/categoryModel.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await listCategories();
  return res.json({ categories });
});

export const createNewCategory = asyncHandler(async (req, res) => {
  const category = await createCategory(req.validated.body);
  await addAuditLog({
    userId: req.user.id,
    action: "create",
    entityType: "category",
    entityId: category.id,
    details: category
  });
  return res.status(201).json({ category });
});

export const updateExistingCategory = asyncHandler(async (req, res) => {
  const category = await updateCategory(Number(req.params.id), req.validated.body);
  await addAuditLog({
    userId: req.user.id,
    action: "update",
    entityType: "category",
    entityId: category.id,
    details: category
  });
  return res.json({ category });
});

export const deleteExistingCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await deleteCategory(id);
  await addAuditLog({ userId: req.user.id, action: "delete", entityType: "category", entityId: id });
  return res.json({ ok: true });
});


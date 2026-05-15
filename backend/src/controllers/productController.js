import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { addAuditLog } from "../models/auditModel.js";
import { archiveProduct, createProduct, getProductByCode, getProductById, listProducts, updateProduct } from "../models/productModel.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { q, status } = req.validated.query;
  const products = await listProducts({ q, status });
  return res.json({ products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductById(Number(req.params.id));
  if (!product) throw httpError(404, "Product not found");
  return res.json({ product });
});

export const createNewProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.validated.body);
  await addAuditLog({ userId: req.user.id, action: "create", entityType: "product", entityId: product.id, details: product });
  return res.status(201).json({ product });
});

export const updateExistingProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(Number(req.params.id), req.validated.body);
  await addAuditLog({ userId: req.user.id, action: "update", entityType: "product", entityId: product.id, details: product });
  return res.json({ product });
});

export const archiveExistingProduct = asyncHandler(async (req, res) => {
  const product = await archiveProduct(Number(req.params.id));
  await addAuditLog({ userId: req.user.id, action: "archive", entityType: "product", entityId: product.id });
  return res.json({ product });
});

export const searchProductByCode = asyncHandler(async (req, res) => {
  const code = req.validated.query.code?.trim();
  if (!code) throw httpError(400, "Missing code");
  const product = await getProductByCode(code);
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json({ product });
});


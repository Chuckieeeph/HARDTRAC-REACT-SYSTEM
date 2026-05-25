import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { archiveExistingProduct, createNewProduct, getProduct, getProducts, searchProductByCode, updateExistingProduct } from "../controllers/productController.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  validate({
    query: z.object({
      q: z.string().optional(),
      status: z.enum(["active", "inactive"]).optional()
    })
  }),
  getProducts
);

router.get(
  "/search",
  validate({
    query: z.object({ code: z.string().min(1) })
  }),
  searchProductByCode
);

router.get("/:id", getProduct);

router.post(
  "/",
  requireRole("admin"),
  validate({
    body: z.object({
      name: z.string().min(1),
      categoryId: z.number().int().optional(),
      supplierId: z.number().int().optional(),
      sku: z.string().min(1),
      barcodeValue: z.string().optional().nullable(),
      rfidValue: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      unit: z.string().optional().nullable(),
      costPrice: z.number().nonnegative(),
      sellingPrice: z.number().nonnegative(),
      currentStock: z.number().int().nonnegative(),
      reorderLevel: z.number().int().nonnegative(),
      status: z.enum(["active", "inactive"])
    })
  }),
  createNewProduct
);

router.patch(
  "/:id",
  requireRole("admin"),
  validate({
    body: z.object({
      name: z.string().min(1),
      categoryId: z.number().int().optional(),
      supplierId: z.number().int().optional(),
      sku: z.string().min(1),
      barcodeValue: z.string().optional().nullable(),
      rfidValue: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      unit: z.string().optional().nullable(),
      costPrice: z.number().nonnegative(),
      sellingPrice: z.number().nonnegative(),
      reorderLevel: z.number().int().nonnegative(),
      status: z.enum(["active", "inactive"])
    })
  }),
  updateExistingProduct
);

router.post("/:id/archive", requireRole("admin"), archiveExistingProduct);

export default router;


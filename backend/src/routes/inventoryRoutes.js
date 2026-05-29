import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { adjustStock, getLowStock, getMovements, getOutOfStock } from "../controllers/inventoryController.js";

const router = Router();
router.use(requireAuth);

router.get("/low-stock", requireRole("admin", "head-cashier"), getLowStock);
router.get("/out-of-stock", requireRole("admin", "head-cashier"), getOutOfStock);

router.get(
  "/movements",
  requireRole("admin", "head-cashier"),
  validate({
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      productId: z.coerce.number().int().optional()
    })
  }),
  getMovements
);

router.post(
  "/adjust",
  requireRole("admin"),
  validate({
    body: z.object({
      productId: z.number().int(),
      adjustmentType: z.enum(["add", "subtract"]),
      quantity: z.number().int().positive(),
      reason: z.string().min(3)
    })
  }),
  adjustStock
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { createNewSale, getSale, getSales } from "../controllers/salesController.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  requireRole("cashier", "admin"),
  validate({
    body: z.object({
      discountAmount: z.number().nonnegative().optional().default(0),
      cashReceived: z.number().nonnegative(),
      items: z
        .array(
          z.object({
            productId: z.number().int(),
            qty: z.number().int().positive(),
            unitPrice: z.number().nonnegative()
          })
        )
        .min(1)
    })
  }),
  createNewSale
);

router.get(
  "/",
  validate({
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      cashierId: z.coerce.number().int().optional()
    })
  }),
  getSales
);

router.get("/:id", getSale);

export default router;


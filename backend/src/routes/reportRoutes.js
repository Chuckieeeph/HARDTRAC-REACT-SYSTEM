import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { adminDashboard, bestSellers, cashierDashboard, cashierPerformance, salesSummary } from "../controllers/reportController.js";

const router = Router();
router.use(requireAuth);

router.get("/admin-dashboard", requireRole("admin"), adminDashboard);
router.get("/cashier-dashboard", requireRole("cashier", "head-cashier", "admin"), cashierDashboard);

router.get(
  "/sales-summary",
  requireRole("admin"),
  validate({ query: z.object({ from: z.string().optional(), to: z.string().optional() }) }),
  salesSummary
);

router.get(
  "/best-sellers",
  requireRole("admin"),
  validate({
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.coerce.number().int().optional().default(10)
    })
  }),
  bestSellers
);

router.get(
  "/cashier-performance",
  requireRole("admin"),
  validate({ query: z.object({ from: z.string().optional(), to: z.string().optional() }) }),
  cashierPerformance
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get(
  "/",
  validate({
    query: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      userId: z.coerce.number().int().optional()
    })
  }),
  getAuditLogs
);

export default router;


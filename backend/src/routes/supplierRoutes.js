import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { createNewSupplier, deleteExistingSupplier, getSuppliers, updateExistingSupplier } from "../controllers/supplierController.js";

const router = Router();
router.use(requireAuth);

router.get("/", getSuppliers);

router.post(
  "/",
  requireRole("admin"),
  validate({
    body: z.object({
      name: z.string().min(1),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional()
    })
  }),
  createNewSupplier
);

router.patch(
  "/:id",
  requireRole("admin"),
  validate({
    body: z.object({
      name: z.string().min(1),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional()
    })
  }),
  updateExistingSupplier
);

router.delete("/:id", requireRole("admin"), deleteExistingSupplier);

export default router;


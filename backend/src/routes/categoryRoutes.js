import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { createNewCategory, deleteExistingCategory, getCategories, updateExistingCategory } from "../controllers/categoryController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCategories);

router.post(
  "/",
  requireRole("admin"),
  validate({ body: z.object({ name: z.string().min(1) }) }),
  createNewCategory
);

router.patch(
  "/:id",
  requireRole("admin"),
  validate({ body: z.object({ name: z.string().min(1) }) }),
  updateExistingCategory
);

router.delete("/:id", requireRole("admin"), deleteExistingCategory);

export default router;


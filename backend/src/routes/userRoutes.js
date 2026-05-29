import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../utils/validation.js";
import { changePassword, createNewUser, getAllUsers, updateExistingUser } from "../controllers/userController.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", getAllUsers);

router.post(
  "/",
  validate({
      body: z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["admin", "cashier", "head-cashier"]),
        fullName: z.string().min(1)
      })
    }),
  createNewUser
);

router.patch(
  "/:id",
  validate({
      body: z
      .object({
        role: z.enum(["admin", "cashier", "head-cashier"]).optional(),
        fullName: z.string().min(1).optional(),
        status: z.enum(["active", "inactive"]).optional()
      })
      .strict()
  }),
  updateExistingUser
);

router.post(
  "/:id/reset-password",
  validate({
    body: z.object({ password: z.string().min(6) })
  }),
  changePassword
);

export default router;

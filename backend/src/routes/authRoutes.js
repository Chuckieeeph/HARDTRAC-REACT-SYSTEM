import { Router } from "express";
import { z } from "zod";
import { validate } from "../utils/validation.js";
import { login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post(
  "/login",
  validate({
    body: z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    })
  }),
  login
);

router.get("/me", requireAuth, me);

export default router;


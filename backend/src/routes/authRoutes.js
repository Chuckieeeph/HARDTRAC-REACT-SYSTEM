import { Router } from "express";
import { z } from "zod";
import { validate } from "../utils/validation.js";
import { login, me, rfidLogin } from "../controllers/authController.js";
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

router.post(
  "/rfid-login",
  validate({
    body: z.object({
      rfidValue: z.string().trim().min(1).max(80)
    })
  }),
  rfidLogin
);

router.get("/me", requireAuth, me);

export default router;

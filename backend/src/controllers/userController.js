import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { addAuditLog } from "../models/auditModel.js";
import { createUser, listUsers, resetUserPassword, updateUser } from "../models/userModel.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();
  return res.json({ users });
});

export const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, role, fullName, rfidValue } = req.validated.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ username, passwordHash, role, fullName, rfidValue });
  await addAuditLog({
    userId: req.user.id,
    action: "create",
    entityType: "user",
    entityId: user.id,
    details: { username, role, rfidAssigned: Boolean(rfidValue) }
  });
  return res.status(201).json({ user });
});

export const updateExistingUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) throw httpError(400, "Invalid user id");
  const user = await updateUser(id, req.validated.body);
  const { rfidValue, ...safeBody } = req.validated.body;
  await addAuditLog({
    userId: req.user.id,
    action: "update",
    entityType: "user",
    entityId: id,
    details: {
      ...safeBody,
      rfidUpdated: rfidValue !== undefined
    }
  });
  return res.json({ user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) throw httpError(400, "Invalid user id");
  const { password } = req.validated.body;
  const passwordHash = await bcrypt.hash(password, 10);
  await resetUserPassword(id, passwordHash);
  await addAuditLog({
    userId: req.user.id,
    action: "password_reset",
    entityType: "user",
    entityId: id
  });
  return res.json({ ok: true });
});

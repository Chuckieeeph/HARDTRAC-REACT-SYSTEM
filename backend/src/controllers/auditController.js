import { asyncHandler } from "../utils/asyncHandler.js";
import { listAuditLogs } from "../models/auditModel.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs(req.validated.query);
  return res.json({ logs });
});


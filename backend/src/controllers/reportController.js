import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAdminDashboardSummary,
  getBestSellers,
  getCashierDashboardSummary,
  getCashierPerformance,
  getSalesSummary
} from "../models/reportModel.js";

export const adminDashboard = asyncHandler(async (req, res) => {
  const summary = await getAdminDashboardSummary();
  return res.json({ summary });
});

export const cashierDashboard = asyncHandler(async (req, res) => {
  const summary = await getCashierDashboardSummary(req.user.id);
  return res.json({ summary });
});

export const salesSummary = asyncHandler(async (req, res) => {
  const summary = await getSalesSummary(req.validated.query);
  return res.json({ summary });
});

export const bestSellers = asyncHandler(async (req, res) => {
  const rows = await getBestSellers(req.validated.query);
  return res.json({ rows });
});

export const cashierPerformance = asyncHandler(async (req, res) => {
  const rows = await getCashierPerformance(req.validated.query);
  return res.json({ rows });
});

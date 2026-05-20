import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = req.user.role === 'super_admin' || req.user.role === 'admin' ? req.query.branch as string : req.user.branch?.toString();
  const stats = await DashboardService.getStats(branchId);
  res.json({ success: true, data: stats });
});

export const getRevenueChart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = req.query.branch as string;
  const days = parseInt(req.query.days as string) || 30;
  const data = await DashboardService.getRevenueChart(branchId, days);
  res.json({ success: true, data });
});

export const getTopProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = req.query.branch as string;
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await DashboardService.getTopProducts(branchId, limit);
  res.json({ success: true, data });
});

export const getOrdersByStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = req.query.branch as string;
  const data = await DashboardService.getOrdersByStatus(branchId);
  res.json({ success: true, data });
});

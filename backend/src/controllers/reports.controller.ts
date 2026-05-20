import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReportsService } from '../services/reports.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getDailySales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getDailySales(req.query.branch as string, req.query.date as string);
  res.json({ success: true, data });
});

export const getMonthlySales = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getMonthlySales(
    req.query.branch as string,
    req.query.year ? parseInt(req.query.year as string) : undefined,
    req.query.month ? parseInt(req.query.month as string) : undefined
  );
  res.json({ success: true, data });
});

export const getCustomerReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getCustomerReport(parseInt(req.query.page as string) || 1);
  res.json({ success: true, data });
});

export const getOrderReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getOrderReport(req.query.branch as string, req.query.startDate as string, req.query.endDate as string);
  res.json({ success: true, data });
});

export const getRiderReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getRiderReport(req.query.startDate as string, req.query.endDate as string);
  res.json({ success: true, data });
});

export const getKitchenReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getKitchenReport(req.query.branch as string);
  res.json({ success: true, data });
});

export const getBranchReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getBranchReport();
  res.json({ success: true, data });
});

export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ReportsService.getInventoryReport(req.query.branch as string);
  res.json({ success: true, data });
});

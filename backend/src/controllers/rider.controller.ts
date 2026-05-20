import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RiderService } from '../services/rider.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getRiders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await RiderService.getRiders({
    status: req.query.status as string,
    branch: req.query.branch as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...data });
});

export const getRiderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rider = await RiderService.getRiderById(req.params.id);
  res.json({ success: true, data: rider });
});

export const getRiderAssignments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await RiderService.getRiderAssignments(req.params.id, {
    status: req.query.status as string,
    page: parseInt(req.query.page as string) || 1,
  });
  res.json({ success: true, ...data });
});

export const getRiderStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await RiderService.getRiderStats(req.params.id);
  res.json({ success: true, data: stats });
});

export const getActiveOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await RiderService.getActiveOrders(req.params.id);
  res.json({ success: true, data: orders });
});

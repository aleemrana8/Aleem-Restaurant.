import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { KitchenService } from '../services/kitchen.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getQueue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = (req.query.branch || req.user.branch) as string;
  const queue = await KitchenService.getQueue(branchId, req.query.status as string);
  res.json({ success: true, data: queue });
});

export const updateItemStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queue = await KitchenService.updateItemStatus(req.params.id, req.body.itemIndex, req.body.status);
  res.json({ success: true, data: queue });
});

export const updateQueueStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queue = await KitchenService.updateQueueStatus(req.params.id, req.body.status, req.body.delayReason);
  res.json({ success: true, data: queue });
});

export const assignToStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const queue = await KitchenService.assignToStaff(req.params.id, req.body.staffId);
  res.json({ success: true, data: queue });
});

export const getKitchenStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branchId = (req.query.branch || req.user.branch) as string;
  const stats = await KitchenService.getKitchenStats(branchId);
  res.json({ success: true, data: stats });
});

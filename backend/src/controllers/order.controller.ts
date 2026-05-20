import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderService } from '../services/order.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await OrderService.getOrders({
    branch: req.query.branch as string,
    status: req.query.status as string,
    orderType: req.query.orderType as string,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  });
  res.json({ success: true, ...data });
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await OrderService.getOrderById(req.params.id);
  res.json({ success: true, data: order });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await OrderService.updateOrderStatus(
    req.params.id,
    req.body.status,
    req.user._id,
    req.user.role,
    req.body.note
  );
  res.json({ success: true, data: order });
});

export const assignRider = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await OrderService.assignRider(req.params.id, req.body.riderId);
  res.json({ success: true, data: order });
});

export const getOrderStatusLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = await OrderService.getOrderStatusLogs(req.params.id);
  res.json({ success: true, data: logs });
});

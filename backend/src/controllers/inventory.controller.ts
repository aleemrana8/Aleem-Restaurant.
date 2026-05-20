import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventory.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await InventoryService.getItems({
    branch: req.query.branch as string,
    category: req.query.category as string,
    lowStock: req.query.lowStock === 'true',
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...data });
});

export const getItemById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await InventoryService.getItemById(req.params.id);
  res.json({ success: true, data: item });
});

export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await InventoryService.createItem(req.body);
  res.status(201).json({ success: true, data: item });
});

export const updateItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await InventoryService.updateItem(req.params.id, req.body);
  res.json({ success: true, data: item });
});

export const adjustStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const item = await InventoryService.adjustStock(req.params.id, req.body.type, req.body.quantity, req.body.reason, req.user._id);
  res.json({ success: true, data: item });
});

export const getMovements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await InventoryService.getMovements(req.params.id, parseInt(req.query.page as string) || 1);
  res.json({ success: true, ...data });
});

export const getLowStockAlerts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const items = await InventoryService.getLowStockAlerts(req.query.branch as string);
  res.json({ success: true, data: items });
});

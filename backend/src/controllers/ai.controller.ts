import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AiService } from '../services/ai.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const type = (req.query.type as any) || 'combo';
  const data = await AiService.getRecommendations(type, req.query.branch as string, req.query.customer as string);
  res.json({ success: true, data });
});

export const generateRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, branchId, customerId } = req.body;
  const data = await AiService.getRecommendations(type || 'combo', branchId, customerId);
  res.json({ success: true, data });
});

export const getSalesForecast = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const data = await AiService.getSalesForecast(req.query.branch as string, days);
  res.json({ success: true, data });
});

export const getDemandForecast = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await AiService.getDemandForecast(req.query.branch as string);
  res.json({ success: true, data });
});

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });
  const data = await AiService.chat(message, req.query.customerId as string);
  res.json({ success: true, data });
});

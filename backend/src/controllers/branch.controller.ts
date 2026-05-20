import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BranchService } from '../services/branch.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getBranches = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branches = await BranchService.getBranches({ city: req.query.city as string, isActive: req.query.isActive === 'true' ? true : undefined });
  res.json({ success: true, data: branches });
});

export const getBranchById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await BranchService.getBranchById(req.params.id);
  res.json({ success: true, data: branch });
});

export const createBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await BranchService.createBranch(req.body);
  res.status(201).json({ success: true, data: branch });
});

export const updateBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await BranchService.updateBranch(req.params.id, req.body);
  res.json({ success: true, data: branch });
});

export const deleteBranch = asyncHandler(async (req: AuthRequest, res: Response) => {
  await BranchService.deleteBranch(req.params.id);
  res.json({ success: true, message: 'Branch deleted.' });
});

export const toggleOpen = asyncHandler(async (req: AuthRequest, res: Response) => {
  const branch = await BranchService.toggleOpen(req.params.id);
  res.json({ success: true, data: branch });
});

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomerService } from '../services/customer.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await CustomerService.getCustomers({
    search: req.query.search as string,
    isBlocked: req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
    sortBy: req.query.sortBy as string,
  });
  res.json({ success: true, ...data });
});

export const getCustomerById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await CustomerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
});

export const getCustomerOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await CustomerService.getCustomerOrders(req.params.id, parseInt(req.query.page as string) || 1);
  res.json({ success: true, ...data });
});

export const blockCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await CustomerService.blockCustomer(req.params.id, req.body.reason);
  res.json({ success: true, data: customer });
});

export const unblockCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await CustomerService.unblockCustomer(req.params.id);
  res.json({ success: true, data: customer });
});

export const updateNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await CustomerService.updateCustomerNotes(req.params.id, req.body.notes);
  res.json({ success: true, data: customer });
});

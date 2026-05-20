import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EmployeeService } from '../services/employee.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getEmployees = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await EmployeeService.getEmployees({
    role: req.query.role as string,
    branch: req.query.branch as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...data });
});

export const getEmployeeById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await EmployeeService.getEmployeeById(req.params.id);
  res.json({ success: true, data: employee });
});

export const createEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await EmployeeService.createEmployee(req.body);
  res.status(201).json({ success: true, data: employee });
});

export const updateEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
  res.json({ success: true, data: employee });
});

export const deleteEmployee = asyncHandler(async (req: AuthRequest, res: Response) => {
  await EmployeeService.deleteEmployee(req.params.id);
  res.json({ success: true, message: 'Employee deleted.' });
});

export const toggleActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await EmployeeService.toggleActive(req.params.id);
  res.json({ success: true, data: employee });
});

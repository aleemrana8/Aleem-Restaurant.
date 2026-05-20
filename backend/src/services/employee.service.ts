import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { AppError } from '../middleware/AppError';

export class EmployeeService {
  static async getEmployees(filters: { role?: string; branch?: string; isActive?: boolean; search?: string; page?: number; limit?: number }) {
    const { role, branch, isActive, search, page = 1, limit = 20 } = filters;
    const query: any = { role: { $ne: 'customer' } };

    if (role) query.role = role;
    if (branch) query.branch = branch;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      Admin.find(query).populate('branch', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Admin.countDocuments(query),
    ]);

    return { employees, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getEmployeeById(id: string) {
    const employee = await Admin.findById(id).populate('branch', 'name');
    if (!employee) throw new AppError('Employee not found.', 404);
    return employee;
  }

  static async createEmployee(data: any) {
    const existing = await Admin.findOne({ email: data.email });
    if (existing) throw new AppError('Email already in use.', 409);

    data.password = await bcrypt.hash(data.password, 12);
    return Admin.create(data);
  }

  static async updateEmployee(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    const employee = await Admin.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!employee) throw new AppError('Employee not found.', 404);
    return employee;
  }

  static async deleteEmployee(id: string) {
    const employee = await Admin.findById(id);
    if (!employee) throw new AppError('Employee not found.', 404);
    if (employee.role === 'super_admin') throw new AppError('Cannot delete super admin.', 403);
    await employee.deleteOne();
    return employee;
  }

  static async toggleActive(id: string) {
    const employee = await Admin.findById(id);
    if (!employee) throw new AppError('Employee not found.', 404);
    employee.isActive = !employee.isActive;
    await employee.save();
    return employee;
  }
}

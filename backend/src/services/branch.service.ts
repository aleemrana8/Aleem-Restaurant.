import { Branch } from '../models/Branch';
import { AppError } from '../middleware/AppError';

export class BranchService {
  static async getBranches(filters: { city?: string; isActive?: boolean }) {
    const query: any = {};
    if (filters.city) query.city = filters.city;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    return Branch.find(query).sort({ name: 1 });
  }

  static async getBranchById(id: string) {
    const branch = await Branch.findById(id);
    if (!branch) throw new AppError('Branch not found.', 404);
    return branch;
  }

  static async createBranch(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    data.slug = slug;
    return Branch.create(data);
  }

  static async updateBranch(id: string, data: any) {
    const branch = await Branch.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!branch) throw new AppError('Branch not found.', 404);
    return branch;
  }

  static async deleteBranch(id: string) {
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) throw new AppError('Branch not found.', 404);
    return branch;
  }

  static async toggleOpen(id: string) {
    const branch = await Branch.findById(id);
    if (!branch) throw new AppError('Branch not found.', 404);
    branch.isOpen = !branch.isOpen;
    await branch.save();
    return branch;
  }
}

import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { AppError } from '../middleware/AppError';

export class CustomerService {
  static async getCustomers(filters: {
    search?: string;
    isBlocked?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const { search, isBlocked, page = 1, limit = 20, sortBy = '-createdAt' } = filters;
    const query: any = {};

    if (isBlocked !== undefined) query.isBlocked = isBlocked;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find(query).sort(sortBy).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);

    return { customers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getCustomerById(id: string) {
    const customer = await Customer.findById(id);
    if (!customer) throw new AppError('Customer not found.', 404);
    return customer;
  }

  static async getCustomerOrders(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ customer: customerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ customer: customerId }),
    ]);
    return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async blockCustomer(id: string, reason: string) {
    const customer = await Customer.findByIdAndUpdate(id, { isBlocked: true, blockedReason: reason }, { new: true });
    if (!customer) throw new AppError('Customer not found.', 404);
    return customer;
  }

  static async unblockCustomer(id: string) {
    const customer = await Customer.findByIdAndUpdate(id, { isBlocked: false, blockedReason: null }, { new: true });
    if (!customer) throw new AppError('Customer not found.', 404);
    return customer;
  }

  static async updateCustomerNotes(id: string, notes: string) {
    const customer = await Customer.findByIdAndUpdate(id, { notes }, { new: true });
    if (!customer) throw new AppError('Customer not found.', 404);
    return customer;
  }
}

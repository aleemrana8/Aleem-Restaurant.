import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { RiderAssignment } from '../models/RiderAssignment';
import { KitchenQueue } from '../models/KitchenQueue';
import { StockMovement } from '../models/StockMovement';

export class ReportsService {
  static async getDailySales(branchId?: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const match: any = { createdAt: { $gte: start, $lte: end }, paymentStatus: 'paid' };
    if (branchId) match.branch = branchId;

    const [summary, hourly, byType, byPayment] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: { $hour: '$createdAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$orderType', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
    ]);

    return {
      date: start.toISOString().split('T')[0],
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      hourly,
      byType,
      byPayment,
    };
  }

  static async getMonthlySales(branchId?: string, year?: number, month?: number) {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const match: any = { createdAt: { $gte: start, $lte: end }, paymentStatus: 'paid' };
    if (branchId) match.branch = branchId;

    const [summary, daily] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: { $dayOfMonth: '$createdAt' }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      year: y,
      month: m,
      summary: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
      daily,
    };
  }

  static async getCustomerReport(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      Customer.find()
        .sort({ totalSpent: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email phone totalOrders totalSpent lastOrderAt createdAt')
        .lean(),
      Customer.countDocuments(),
    ]);

    const stats = await Customer.aggregate([
      { $group: { _id: null, totalCustomers: { $sum: 1 }, avgSpent: { $avg: '$totalSpent' }, avgOrders: { $avg: '$totalOrders' } } },
    ]);

    return { customers, stats: stats[0] || {}, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getOrderReport(branchId?: string, startDate?: string, endDate?: string) {
    const match: any = {};
    if (branchId) match.branch = branchId;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [byStatus, byBranch, cancellations] = await Promise.all([
      Order.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: match }, { $group: { _id: '$branch', count: { $sum: 1 }, revenue: { $sum: '$total' } } }, { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } }, { $unwind: '$branch' }]),
      Order.countDocuments({ ...match, status: 'cancelled' }),
    ]);

    return { byStatus, byBranch, cancellations };
  }

  static async getRiderReport(startDate?: string, endDate?: string) {
    const match: any = { status: 'delivered' };
    if (startDate || endDate) {
      match.deliveredAt = {};
      if (startDate) match.deliveredAt.$gte = new Date(startDate);
      if (endDate) match.deliveredAt.$lte = new Date(endDate);
    }

    const data = await RiderAssignment.aggregate([
      { $match: match },
      { $group: { _id: '$rider', deliveries: { $sum: 1 }, totalEarnings: { $sum: '$earnings' }, avgRating: { $avg: '$rating' } } },
      { $lookup: { from: 'admins', localField: '_id', foreignField: '_id', as: 'rider' } },
      { $unwind: '$rider' },
      { $project: { 'rider.name': 1, 'rider.email': 1, deliveries: 1, totalEarnings: 1, avgRating: 1 } },
      { $sort: { deliveries: -1 } },
    ]);

    return data;
  }

  static async getKitchenReport(branchId?: string) {
    const match: any = { status: 'completed', startedAt: { $exists: true }, completedAt: { $exists: true } };
    if (branchId) match.branch = branchId;

    const [avgTime, throughput] = await Promise.all([
      KitchenQueue.aggregate([
        { $match: match },
        { $project: { duration: { $subtract: ['$completedAt', '$startedAt'] } } },
        { $group: { _id: null, avgDuration: { $avg: '$duration' }, minDuration: { $min: '$duration' }, maxDuration: { $max: '$duration' }, totalCompleted: { $sum: 1 } } },
      ]),
      KitchenQueue.aggregate([
        { $match: { ...match, completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dayOfWeek: '$completedAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      avgPreparationMs: avgTime[0]?.avgDuration || 0,
      avgPreparationMin: avgTime[0] ? Math.round(avgTime[0].avgDuration / 60000) : 0,
      totalCompleted: avgTime[0]?.totalCompleted || 0,
      weeklyThroughput: throughput,
    };
  }

  static async getBranchReport() {
    const data = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$branch', totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: '$branch' },
      { $project: { 'branch.name': 1, 'branch.city': 1, totalRevenue: 1, totalOrders: 1, avgOrderValue: 1 } },
      { $sort: { totalRevenue: -1 } },
    ]);
    return data;
  }

  static async getInventoryReport(branchId?: string) {
    const match: any = {};
    if (branchId) match.branch = branchId;

    const movements = await StockMovement.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' }, totalCost: { $sum: '$totalCost' } } },
    ]);

    return { movements };
  }
}

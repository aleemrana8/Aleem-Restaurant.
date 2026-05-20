import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { Product } from '../models/Product';
import { Branch } from '../models/Branch';

export class DashboardService {
  static async getStats(branchId?: string) {
    const branchFilter = branchId ? { branch: branchId } : {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFilter = { ...branchFilter, createdAt: { $gte: today } };

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalCustomers,
      activeProducts,
      pendingOrders,
      preparingOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(branchFilter),
      Order.countDocuments(todayFilter),
      Order.aggregate([{ $match: { ...branchFilter, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { ...todayFilter, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Customer.countDocuments(),
      Product.countDocuments({ isAvailable: true, isPublished: true, ...branchFilter }),
      Order.countDocuments({ ...branchFilter, status: 'pending' }),
      Order.countDocuments({ ...branchFilter, status: 'preparing' }),
      Order.find(branchFilter).sort({ createdAt: -1 }).limit(10).populate('customer', 'name email').lean(),
    ]);

    return {
      totalOrders,
      todayOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalCustomers,
      activeProducts,
      pendingOrders,
      preparingOrders,
      recentOrders,
    };
  }

  static async getRevenueChart(branchId?: string, days: number = 30) {
    const branchFilter = branchId ? { branch: branchId } : {};
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Order.aggregate([
      { $match: { ...branchFilter, paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return data;
  }

  static async getTopProducts(branchId?: string, limit: number = 10) {
    const branchFilter = branchId ? { branch: branchId } : {};

    const data = await Order.aggregate([
      { $match: branchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    return data;
  }

  static async getOrdersByStatus(branchId?: string) {
    const branchFilter = branchId ? { branch: branchId } : {};

    return Order.aggregate([
      { $match: branchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

import { Admin } from '../models/Admin';
import { RiderAssignment } from '../models/RiderAssignment';
import { Order } from '../models/Order';
import { AppError } from '../middleware/AppError';

export class RiderService {
  static async getRiders(filters: { status?: string; branch?: string; page?: number; limit?: number }) {
    const { status, branch, page = 1, limit = 20 } = filters;
    const query: any = { role: 'rider' };

    if (branch) query.branch = branch;
    if (status === 'active') query.isActive = true;

    const skip = (page - 1) * limit;
    const [riders, total] = await Promise.all([
      Admin.find(query).populate('branch', 'name').sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Admin.countDocuments(query),
    ]);

    return { riders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getRiderById(id: string) {
    const rider = await Admin.findOne({ _id: id, role: 'rider' }).populate('branch', 'name');
    if (!rider) throw new AppError('Rider not found.', 404);
    return rider;
  }

  static async getRiderAssignments(riderId: string, filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;
    const query: any = { rider: riderId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
      RiderAssignment.find(query).populate('order', 'orderNumber total deliveryAddress').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      RiderAssignment.countDocuments(query),
    ]);

    return { assignments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getRiderStats(riderId: string) {
    const [totalDeliveries, todayDeliveries, avgRating, totalEarnings] = await Promise.all([
      RiderAssignment.countDocuments({ rider: riderId, status: 'delivered' }),
      RiderAssignment.countDocuments({
        rider: riderId,
        status: 'delivered',
        deliveredAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      RiderAssignment.aggregate([
        { $match: { rider: riderId as any, rating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
      RiderAssignment.aggregate([
        { $match: { rider: riderId as any, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$earnings' } } },
      ]),
    ]);

    return {
      totalDeliveries,
      todayDeliveries,
      avgRating: avgRating[0]?.avg || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
    };
  }

  static async getActiveOrders(riderId: string) {
    return Order.find({
      rider: riderId,
      status: { $in: ['rider_assigned', 'picked_up', 'out_for_delivery'] },
    })
      .populate('customer', 'name phone')
      .populate('branch', 'name address')
      .sort({ createdAt: -1 });
  }
}

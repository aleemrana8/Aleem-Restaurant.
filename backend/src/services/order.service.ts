import { Order } from '../models/Order';
import { OrderStatusLog } from '../models/OrderStatusLog';
import { KitchenQueue } from '../models/KitchenQueue';
import { AppError } from '../middleware/AppError';
import { ORDER_STATUS_TRANSITIONS } from '../config/constants';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  static async getOrders(filters: {
    branch?: string;
    status?: string;
    orderType?: string;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { branch, status, orderType, search, page = 1, limit = 20, startDate, endDate } = filters;
    const query: any = {};

    if (branch) query.branch = branch;
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('branch', 'name')
        .populate('rider', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getOrderById(id: string) {
    const order = await Order.findById(id)
      .populate('customer', 'name email phone addresses')
      .populate('branch', 'name address phone')
      .populate('rider', 'name phone')
      .populate('items.product', 'name images');

    if (!order) throw new AppError('Order not found.', 404);
    return order;
  }

  static async updateOrderStatus(orderId: string, newStatus: string, userId?: string, userRole?: string, note?: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found.', 404);

    const currentStatus = order.status as any;
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus as keyof typeof ORDER_STATUS_TRANSITIONS];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus as any)) {
      throw new AppError(`Cannot transition from ${currentStatus} to ${newStatus}.`, 400);
    }

    const previousStatus = order.status;
    order.status = newStatus;

    // Set timestamps based on status
    if (newStatus === 'preparing') order.preparationStartedAt = new Date();
    if (newStatus === 'ready') order.preparationCompletedAt = new Date();
    if (newStatus === 'picked_up') order.pickedUpAt = new Date();
    if (newStatus === 'delivered') order.deliveredAt = new Date();
    if (newStatus === 'cancelled') {
      order.cancelledAt = new Date();
      if (userId) order.cancelledBy = userId as any;
    }

    await order.save();

    // Log status change
    await OrderStatusLog.create({
      order: order._id,
      fromStatus: previousStatus,
      toStatus: newStatus,
      changedBy: userId,
      changedByRole: userRole,
      note,
    });

    // Create kitchen queue when order is confirmed
    if (newStatus === 'confirmed') {
      await KitchenQueue.create({
        order: order._id,
        branch: order.branch,
        items: order.items.map(item => ({
          product: item.product,
          productName: item.productName,
          quantity: item.quantity,
          variant: item.variant,
          size: item.size,
          addons: item.addons,
          spiceLevel: item.spiceLevel,
          specialInstructions: item.specialInstructions,
        })),
        priority: order.orderType === 'dine_in' ? 2 : 1,
      });
    }

    return order;
  }

  static async assignRider(orderId: string, riderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found.', 404);

    if (!['ready', 'rider_assigned'].includes(order.status)) {
      throw new AppError('Order must be ready before assigning a rider.', 400);
    }

    order.rider = riderId as any;
    order.riderAssignedAt = new Date();
    order.status = 'rider_assigned';
    await order.save();

    await OrderStatusLog.create({
      order: order._id,
      fromStatus: 'ready',
      toStatus: 'rider_assigned',
      note: `Rider assigned: ${riderId}`,
    });

    return order;
  }

  static async getOrderStatusLogs(orderId: string) {
    return OrderStatusLog.find({ order: orderId })
      .populate('changedBy', 'name role')
      .sort({ createdAt: 1 });
  }

  static generateOrderNumber(): string {
    const date = new Date();
    const prefix = `ALM${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const suffix = uuidv4().slice(0, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  }
}

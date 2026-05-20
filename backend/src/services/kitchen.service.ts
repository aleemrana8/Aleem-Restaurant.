import { KitchenQueue } from '../models/KitchenQueue';
import { AppError } from '../middleware/AppError';

export class KitchenService {
  static async getQueue(branchId: string, status?: string) {
    const query: any = { branch: branchId };
    if (status) query.status = status;

    return KitchenQueue.find(query)
      .populate('order', 'orderNumber orderType createdAt')
      .populate('assignedTo', 'name')
      .sort({ priority: -1, createdAt: 1 });
  }

  static async updateItemStatus(queueId: string, itemIndex: number, status: string) {
    const queue = await KitchenQueue.findById(queueId);
    if (!queue) throw new AppError('Kitchen queue item not found.', 404);

    if (itemIndex < 0 || itemIndex >= queue.items.length) {
      throw new AppError('Invalid item index.', 400);
    }

    queue.items[itemIndex].status = status;
    if (status === 'in_progress') queue.items[itemIndex].startedAt = new Date();
    if (status === 'completed') queue.items[itemIndex].completedAt = new Date();

    // Check if all items are completed
    const allCompleted = queue.items.every(item => item.status === 'completed');
    if (allCompleted) {
      queue.status = 'completed';
      queue.completedAt = new Date();
    } else if (queue.status === 'queued') {
      queue.status = 'in_progress';
      queue.startedAt = new Date();
    }

    await queue.save();
    return queue;
  }

  static async updateQueueStatus(queueId: string, status: string, delayReason?: string) {
    const queue = await KitchenQueue.findById(queueId);
    if (!queue) throw new AppError('Kitchen queue item not found.', 404);

    queue.status = status;
    if (status === 'in_progress' && !queue.startedAt) queue.startedAt = new Date();
    if (status === 'completed') queue.completedAt = new Date();
    if (status === 'delayed' && delayReason) queue.delayReason = delayReason;

    await queue.save();
    return queue;
  }

  static async assignToStaff(queueId: string, staffId: string) {
    const queue = await KitchenQueue.findByIdAndUpdate(queueId, { assignedTo: staffId }, { new: true });
    if (!queue) throw new AppError('Kitchen queue item not found.', 404);
    return queue;
  }

  static async getKitchenStats(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [queued, inProgress, completed, delayed] = await Promise.all([
      KitchenQueue.countDocuments({ branch: branchId, status: 'queued' }),
      KitchenQueue.countDocuments({ branch: branchId, status: 'in_progress' }),
      KitchenQueue.countDocuments({ branch: branchId, status: 'completed', completedAt: { $gte: today } }),
      KitchenQueue.countDocuments({ branch: branchId, status: 'delayed' }),
    ]);

    const avgTime = await KitchenQueue.aggregate([
      { $match: { branch: branchId as any, status: 'completed', startedAt: { $exists: true }, completedAt: { $exists: true } } },
      { $project: { duration: { $subtract: ['$completedAt', '$startedAt'] } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } },
    ]);

    return {
      queued,
      inProgress,
      completedToday: completed,
      delayed,
      avgPreparationTime: avgTime[0]?.avg ? Math.round(avgTime[0].avg / 60000) : 0,
    };
  }
}

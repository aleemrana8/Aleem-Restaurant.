import { CmsBanner } from '../models/CmsBanner';
import { CmsPost } from '../models/CmsPost';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/AppError';

export class CmsService {
  // Banners
  static async getBanners(filters: { position?: string; isActive?: boolean }) {
    const query: any = {};
    if (filters.position) query.position = filters.position;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    return CmsBanner.find(query).sort({ sortOrder: 1, createdAt: -1 });
  }

  static async createBanner(data: any) {
    return CmsBanner.create(data);
  }

  static async updateBanner(id: string, data: any) {
    const banner = await CmsBanner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!banner) throw new AppError('Banner not found.', 404);
    return banner;
  }

  static async deleteBanner(id: string) {
    const banner = await CmsBanner.findByIdAndDelete(id);
    if (!banner) throw new AppError('Banner not found.', 404);
    return banner;
  }

  // Posts
  static async getPosts(filters: { category?: string; isPublished?: boolean; page?: number; limit?: number }) {
    const { category, isPublished, page = 1, limit = 20 } = filters;
    const query: any = {};
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished;

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      CmsPost.find(query).populate('author', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CmsPost.countDocuments(query),
    ]);
    return { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async createPost(data: any) {
    if (!data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
    return CmsPost.create(data);
  }

  static async updatePost(id: string, data: any) {
    if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
    const post = await CmsPost.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!post) throw new AppError('Post not found.', 404);
    return post;
  }

  static async deletePost(id: string) {
    const post = await CmsPost.findByIdAndDelete(id);
    if (!post) throw new AppError('Post not found.', 404);
    return post;
  }

  // Notifications
  static async sendNotification(data: { recipientIds?: string[]; title: string; message: string; type: string; data?: any; broadcast?: boolean }) {
    if (data.broadcast) {
      // Not implemented: would send to all users
      return { sent: 0, message: 'Broadcast not yet implemented' };
    }

    if (!data.recipientIds || data.recipientIds.length === 0) {
      throw new AppError('At least one recipient is required.', 400);
    }

    const notifications = data.recipientIds.map(id => ({
      recipient: id,
      recipientModel: 'Admin' as const,
      title: data.title,
      message: data.message,
      type: data.type,
      data: data.data,
    }));

    const result = await Notification.insertMany(notifications);
    return { sent: result.length };
  }

  static async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);
    return { notifications, unread, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found.', 404);
    return notification;
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true, readAt: new Date() });
  }
}

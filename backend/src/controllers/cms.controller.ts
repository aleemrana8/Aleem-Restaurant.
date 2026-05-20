import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CmsService } from '../services/cms.service';
import { asyncHandler } from '../middleware/asyncHandler';

// Banners
export const getBanners = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banners = await CmsService.getBanners({
    position: req.query.position as string,
    isActive: req.query.isActive === 'true' ? true : undefined,
  });
  res.json({ success: true, data: banners });
});

export const createBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banner = await CmsService.createBanner(req.body);
  res.status(201).json({ success: true, data: banner });
});

export const updateBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const banner = await CmsService.updateBanner(req.params.id, req.body);
  res.json({ success: true, data: banner });
});

export const deleteBanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CmsService.deleteBanner(req.params.id);
  res.json({ success: true, message: 'Banner deleted.' });
});

// Posts
export const getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await CmsService.getPosts({
    category: req.query.category as string,
    isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...data });
});

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await CmsService.createPost({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: post });
});

export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await CmsService.updatePost(req.params.id, req.body);
  res.json({ success: true, data: post });
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CmsService.deletePost(req.params.id);
  res.json({ success: true, message: 'Post deleted.' });
});

// Notifications
export const sendNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await CmsService.sendNotification(req.body);
  res.json({ success: true, data: result });
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await CmsService.getNotifications(req.user._id, parseInt(req.query.page as string) || 1);
  res.json({ success: true, ...data });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CmsService.markAsRead(req.params.id, req.user._id);
  res.json({ success: true, message: 'Marked as read.' });
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CmsService.markAllAsRead(req.user._id);
  res.json({ success: true, message: 'All marked as read.' });
});

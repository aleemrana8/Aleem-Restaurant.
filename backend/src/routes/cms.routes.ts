import { Router } from 'express';
import * as ctrl from '../controllers/cms.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);

// Banners
router.get('/banners', authorize(PERMISSIONS.CMS.VIEW), ctrl.getBanners);
router.post('/banners', authorize(PERMISSIONS.CMS.CREATE), ctrl.createBanner);
router.put('/banners/:id', authorize(PERMISSIONS.CMS.UPDATE), ctrl.updateBanner);
router.delete('/banners/:id', authorize(PERMISSIONS.CMS.DELETE), ctrl.deleteBanner);

// Posts
router.get('/posts', authorize(PERMISSIONS.CMS.VIEW), ctrl.getPosts);
router.post('/posts', authorize(PERMISSIONS.CMS.CREATE), ctrl.createPost);
router.put('/posts/:id', authorize(PERMISSIONS.CMS.UPDATE), ctrl.updatePost);
router.delete('/posts/:id', authorize(PERMISSIONS.CMS.DELETE), ctrl.deletePost);

// Notifications
router.post('/notifications/send', authorize(PERMISSIONS.CMS.CREATE), ctrl.sendNotification);
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markAsRead);
router.put('/notifications/read-all', ctrl.markAllAsRead);

export default router;

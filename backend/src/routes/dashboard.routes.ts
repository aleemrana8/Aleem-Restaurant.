import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/stats', authorize(PERMISSIONS.DASHBOARD.VIEW), ctrl.getStats);
router.get('/revenue-chart', authorize(PERMISSIONS.DASHBOARD.VIEW), ctrl.getRevenueChart);
router.get('/top-products', authorize(PERMISSIONS.DASHBOARD.VIEW), ctrl.getTopProducts);
router.get('/orders-by-status', authorize(PERMISSIONS.DASHBOARD.VIEW), ctrl.getOrdersByStatus);

export default router;

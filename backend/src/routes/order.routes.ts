import { Router } from 'express';
import * as ctrl from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.ORDERS.VIEW), ctrl.getOrders);
router.get('/:id', authorize(PERMISSIONS.ORDERS.VIEW), ctrl.getOrderById);
router.put('/:id/status', authorize(PERMISSIONS.ORDERS.UPDATE), ctrl.updateOrderStatus);
router.put('/:id/assign-rider', authorize(PERMISSIONS.RIDERS.ASSIGN), ctrl.assignRider);
router.get('/:id/status-logs', authorize(PERMISSIONS.ORDERS.VIEW), ctrl.getOrderStatusLogs);

export default router;

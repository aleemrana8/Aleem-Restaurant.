import { Router } from 'express';
import * as ctrl from '../controllers/kitchen.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/queue', authorize(PERMISSIONS.KITCHEN.VIEW), ctrl.getQueue);
router.get('/stats', authorize(PERMISSIONS.KITCHEN.VIEW), ctrl.getKitchenStats);
router.put('/:id/item-status', authorize(PERMISSIONS.KITCHEN.UPDATE), ctrl.updateItemStatus);
router.put('/:id/status', authorize(PERMISSIONS.KITCHEN.UPDATE), ctrl.updateQueueStatus);
router.put('/:id/assign', authorize(PERMISSIONS.KITCHEN.UPDATE), ctrl.assignToStaff);

export default router;

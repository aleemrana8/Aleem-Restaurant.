import { Router } from 'express';
import * as ctrl from '../controllers/rider.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.RIDERS.VIEW), ctrl.getRiders);
router.get('/:id', authorize(PERMISSIONS.RIDERS.VIEW), ctrl.getRiderById);
router.get('/:id/assignments', authorize(PERMISSIONS.RIDERS.VIEW), ctrl.getRiderAssignments);
router.get('/:id/stats', authorize(PERMISSIONS.RIDERS.VIEW), ctrl.getRiderStats);
router.get('/:id/active-orders', authorize(PERMISSIONS.RIDERS.VIEW), ctrl.getActiveOrders);

export default router;

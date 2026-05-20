import { Router } from 'express';
import * as ctrl from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.INVENTORY.VIEW), ctrl.getItems);
router.get('/low-stock', authorize(PERMISSIONS.INVENTORY.VIEW), ctrl.getLowStockAlerts);
router.get('/:id', authorize(PERMISSIONS.INVENTORY.VIEW), ctrl.getItemById);
router.post('/', authorize(PERMISSIONS.INVENTORY.CREATE), ctrl.createItem);
router.put('/:id', authorize(PERMISSIONS.INVENTORY.UPDATE), ctrl.updateItem);
router.post('/:id/adjust', authorize(PERMISSIONS.INVENTORY.UPDATE), ctrl.adjustStock);
router.get('/:id/movements', authorize(PERMISSIONS.INVENTORY.VIEW), ctrl.getMovements);

export default router;

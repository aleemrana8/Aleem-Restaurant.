import { Router } from 'express';
import * as ctrl from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.CUSTOMERS.VIEW), ctrl.getCustomers);
router.get('/:id', authorize(PERMISSIONS.CUSTOMERS.VIEW), ctrl.getCustomerById);
router.get('/:id/orders', authorize(PERMISSIONS.CUSTOMERS.VIEW), ctrl.getCustomerOrders);
router.put('/:id/block', authorize(PERMISSIONS.CUSTOMERS.BLOCK), ctrl.blockCustomer);
router.put('/:id/unblock', authorize(PERMISSIONS.CUSTOMERS.BLOCK), ctrl.unblockCustomer);
router.put('/:id/notes', authorize(PERMISSIONS.CUSTOMERS.UPDATE), ctrl.updateNotes);

export default router;

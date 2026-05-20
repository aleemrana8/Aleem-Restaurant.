import { Router } from 'express';
import * as ctrl from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/sales-daily', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getDailySales);
router.get('/sales-monthly', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getMonthlySales);
router.get('/customers', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getCustomerReport);
router.get('/orders', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getOrderReport);
router.get('/riders', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getRiderReport);
router.get('/kitchen', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getKitchenReport);
router.get('/branches', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getBranchReport);
router.get('/inventory', authorize(PERMISSIONS.REPORTS.VIEW), ctrl.getInventoryReport);

export default router;

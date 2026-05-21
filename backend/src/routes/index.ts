import { Router } from 'express';
import authRoutes from './auth.routes';
import otpRoutes from './otp.routes';
import dashboardRoutes from './dashboard.routes';
import orderRoutes from './order.routes';
import publicOrderRoutes from './public-order.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import branchRoutes from './branch.routes';
import customerRoutes from './customer.routes';
import employeeRoutes from './employee.routes';
import riderRoutes from './rider.routes';
import kitchenRoutes from './kitchen.routes';
import inventoryRoutes from './inventory.routes';
import reportsRoutes from './reports.routes';
import cmsRoutes from './cms.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/orders', orderRoutes);
router.use('/public-orders', publicOrderRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/branches', branchRoutes);
router.use('/customers', customerRoutes);
router.use('/employees', employeeRoutes);
router.use('/riders', riderRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/reports', reportsRoutes);
router.use('/cms', cmsRoutes);
router.use('/ai', aiRoutes);
router.use('/inventory', inventoryRoutes);

export default router;

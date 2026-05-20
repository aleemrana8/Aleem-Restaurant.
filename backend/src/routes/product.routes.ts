import { Router } from 'express';
import * as ctrl from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

// Public routes - customer menu
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProductById);

// Protected routes - admin only
router.post('/', authenticate, authorize(PERMISSIONS.PRODUCTS.CREATE), ctrl.createProduct);
router.put('/:id', authenticate, authorize(PERMISSIONS.PRODUCTS.UPDATE), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize(PERMISSIONS.PRODUCTS.DELETE), ctrl.deleteProduct);
router.patch('/:id/toggle-availability', authenticate, authorize(PERMISSIONS.PRODUCTS.UPDATE), ctrl.toggleAvailability);

export default router;

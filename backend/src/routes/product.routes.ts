import { Router } from 'express';
import * as ctrl from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);

// Products
router.get('/', authorize(PERMISSIONS.PRODUCTS.VIEW), ctrl.getProducts);
router.get('/:id', authorize(PERMISSIONS.PRODUCTS.VIEW), ctrl.getProductById);
router.post('/', authorize(PERMISSIONS.PRODUCTS.CREATE), ctrl.createProduct);
router.put('/:id', authorize(PERMISSIONS.PRODUCTS.UPDATE), ctrl.updateProduct);
router.delete('/:id', authorize(PERMISSIONS.PRODUCTS.DELETE), ctrl.deleteProduct);
router.patch('/:id/toggle-availability', authorize(PERMISSIONS.PRODUCTS.UPDATE), ctrl.toggleAvailability);

export default router;

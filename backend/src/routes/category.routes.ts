import { Router } from 'express';
import * as ctrl from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

// Public route - customer menu
router.get('/', ctrl.getCategories);

// Protected routes - admin only
router.post('/', authenticate, authorize(PERMISSIONS.CATEGORIES.CREATE), ctrl.createCategory);
router.put('/:id', authenticate, authorize(PERMISSIONS.CATEGORIES.UPDATE), ctrl.updateCategory);
router.delete('/:id', authenticate, authorize(PERMISSIONS.CATEGORIES.DELETE), ctrl.deleteCategory);

export default router;

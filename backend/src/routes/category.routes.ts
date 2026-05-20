import { Router } from 'express';
import * as ctrl from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.CATEGORIES.VIEW), ctrl.getCategories);
router.post('/', authorize(PERMISSIONS.CATEGORIES.CREATE), ctrl.createCategory);
router.put('/:id', authorize(PERMISSIONS.CATEGORIES.UPDATE), ctrl.updateCategory);
router.delete('/:id', authorize(PERMISSIONS.CATEGORIES.DELETE), ctrl.deleteCategory);

export default router;

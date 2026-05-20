import { Router } from 'express';
import * as ctrl from '../controllers/branch.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.BRANCHES.VIEW), ctrl.getBranches);
router.get('/:id', authorize(PERMISSIONS.BRANCHES.VIEW), ctrl.getBranchById);
router.post('/', authorize(PERMISSIONS.BRANCHES.CREATE), ctrl.createBranch);
router.put('/:id', authorize(PERMISSIONS.BRANCHES.UPDATE), ctrl.updateBranch);
router.delete('/:id', authorize(PERMISSIONS.BRANCHES.DELETE), ctrl.deleteBranch);
router.patch('/:id/toggle-open', authorize(PERMISSIONS.BRANCHES.UPDATE), ctrl.toggleOpen);

export default router;

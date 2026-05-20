import { Router } from 'express';
import * as ctrl from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.EMPLOYEES.VIEW), ctrl.getEmployees);
router.get('/:id', authorize(PERMISSIONS.EMPLOYEES.VIEW), ctrl.getEmployeeById);
router.post('/', authorize(PERMISSIONS.EMPLOYEES.CREATE), ctrl.createEmployee);
router.put('/:id', authorize(PERMISSIONS.EMPLOYEES.UPDATE), ctrl.updateEmployee);
router.delete('/:id', authorize(PERMISSIONS.EMPLOYEES.DELETE), ctrl.deleteEmployee);
router.patch('/:id/toggle-active', authorize(PERMISSIONS.EMPLOYEES.UPDATE), ctrl.toggleActive);

export default router;

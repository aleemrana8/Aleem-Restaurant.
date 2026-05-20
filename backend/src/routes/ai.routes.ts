import { Router } from 'express';
import * as ctrl from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/permissions';
import { PERMISSIONS } from '../config/constants';

const router = Router();

router.use(authenticate);
router.get('/recommendations', authorize(PERMISSIONS.AI.VIEW), ctrl.getRecommendations);
router.post('/recommendations/generate', authorize(PERMISSIONS.AI.GENERATE), ctrl.generateRecommendations);
router.get('/forecast/sales', authorize(PERMISSIONS.AI.VIEW), ctrl.getSalesForecast);
router.get('/forecast/demand', authorize(PERMISSIONS.AI.VIEW), ctrl.getDemandForecast);
router.post('/chat', ctrl.chat);

export default router;

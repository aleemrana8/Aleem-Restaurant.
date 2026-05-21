import { Router } from 'express';
import * as ctrl from '../controllers/otp.controller';

const router = Router();

router.post('/send', ctrl.sendOtp);
router.post('/verify', ctrl.verifyOtp);

export default router;

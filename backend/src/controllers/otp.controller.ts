import { Request, Response } from 'express';
import { OtpService } from '../services/otp.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    return res.status(400).json({ success: false, message: 'Email and purpose are required.' });
  }

  if (!['login', 'register', 'reset_password'].includes(purpose)) {
    return res.status(400).json({ success: false, message: 'Invalid purpose.' });
  }

  await OtpService.sendOtp(email, purpose);
  res.json({ success: true, message: 'OTP sent to your email.' });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, purpose } = req.body;

  if (!email || !otp || !purpose) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and purpose are required.' });
  }

  await OtpService.verifyOtp(email, otp, purpose);
  res.json({ success: true, message: 'OTP verified successfully.' });
});

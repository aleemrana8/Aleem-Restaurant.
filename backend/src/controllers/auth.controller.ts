import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: result });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return res.status(400).json({ success: false, message: 'Refresh token required.' });

  const result = await AuthService.refreshToken(token);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
  });

  res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) await AuthService.logout(req.user._id);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await AuthService.getProfile(req.user._id);
  res.json({ success: true, data: user });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await AuthService.changePassword(req.user._id, currentPassword, newPassword);
  res.json({ success: true, message: 'Password changed successfully.' });
});

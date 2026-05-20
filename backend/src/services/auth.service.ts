import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { env } from '../config/env';
import { AppError } from '../middleware/AppError';
import { ROLE_PERMISSIONS } from '../config/constants';

export class AuthService {
  static generateAccessToken(id: string, role: string): string {
    return jwt.sign({ id, role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn as any });
  }

  static generateRefreshToken(id: string, role: string): string {
    return jwt.sign({ id, role }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn as any });
  }

  static async login(email: string, password: string) {
    const user = await Admin.findOne({ email }).select('+password');
    if (!user) throw new AppError('Invalid email or password.', 401);
    if (!user.isActive) throw new AppError('Account has been deactivated.', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString(), user.role);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions.length > 0 ? user.permissions : ROLE_PERMISSIONS[user.role] || [],
        branch: user.branch,
        avatar: user.avatar,
      },
    };
  }

  static async refreshToken(token: string) {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as { id: string; role: string };
    const user = await Admin.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token.', 401);
    }

    if (!user.isActive) throw new AppError('Account has been deactivated.', 403);

    const accessToken = this.generateAccessToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString(), user.role);

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  static async logout(userId: string) {
    await Admin.findByIdAndUpdate(userId, { refreshToken: null });
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await Admin.findById(userId).select('+password');
    if (!user) throw new AppError('User not found.', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Current password is incorrect.', 400);

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
  }

  static async getProfile(userId: string) {
    const user = await Admin.findById(userId).populate('branch', 'name');
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }
}

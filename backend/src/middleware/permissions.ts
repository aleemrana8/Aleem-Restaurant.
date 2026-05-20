import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ROLE_PERMISSIONS } from '../config/constants';
import { AppError } from './AppError';

export const authorize = (...permissions: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Super admin and admin have all permissions
    if (userRole === 'super_admin' || userRole === 'admin') {
      return next();
    }

    // Check if user has custom permissions override
    if (req.user.permissions && req.user.permissions.length > 0) {
      const hasPermission = permissions.some(p => req.user.permissions.includes(p));
      if (hasPermission) return next();
    }

    // Check role-based permissions
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    if (!hasPermission) {
      return next(new AppError('Insufficient permissions.', 403));
    }

    next();
  };
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions for this role.', 403));
    }

    next();
  };
};

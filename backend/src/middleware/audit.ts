import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLog } from '../models/AuditLog';

export const auditLog = (action: string, resource: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    // Log after the request completes
    const originalEnd = _res.end;
    (_res as any).end = function (...args: any[]) {
      if (_res.statusCode < 400 && req.user) {
        AuditLog.create({
          user: req.user._id,
          userModel: 'Admin',
          action,
          resource,
          resourceId: req.params.id || undefined,
          details: {
            method: req.method,
            path: req.originalUrl,
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
          },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        }).catch(() => {});
      }
      return originalEnd.apply(_res, args);
    };
    next();
  };
};

function sanitizeBody(body: any): any {
  if (!body) return undefined;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'refreshToken', 'token', 'secret'];
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

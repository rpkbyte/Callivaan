/**
 * Automated Compliance Audit Aspect
 * Automatically logs audit events for mutating actions in compliance with Indian DPDPA 2023.
 */
import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '@callivaan/database';
import { log } from '../logger.js';

export function auditTrailAspect(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Skip read-only or webhook streams
  if (!isMutating || req.path.startsWith('/v1/webhooks') || req.path === '/health') {
    return next();
  }

  res.on('finish', () => {
    // Only audit successful operations
    if (res.statusCode >= 200 && res.statusCode < 400) {
      const authReq = req as any;
      const tenantId = authReq.tenantId;
      const actorId = authReq.user?.userId || 'anonymous';
      const actorType = authReq.user ? 'user' : 'system';

      try {
        const db = getDatabase();
        db.recordAuditEvent({
          tenantId,
          actorId,
          actorType,
          action: `${method} ${req.baseUrl || ''}${req.path}`,
          targetEntity: req.path.split('/')[2] || 'resource',
          targetEntityId: req.params?.id || 'collection',
          details: {
            statusCode: res.statusCode,
            ip: req.ip,
          },
          ipAddress: req.ip,
        }).catch((err) => {
          log('warn', '[AOP Audit] Failed to record async audit event:', { err });
        });
      } catch (err) {
        log('warn', '[AOP Audit] Exception writing audit log:', { err });
      }
    }
  });

  next();
}

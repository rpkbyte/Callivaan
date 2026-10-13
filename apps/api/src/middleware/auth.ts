/**
 * Authentication and Tenant Scoping Middleware
 * Strictly conforms to docs/rules.md:
 * - Tenant derived ONLY from authenticated user membership, never from client input.
 * - Least-privilege role checking.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@callivaan/database';
import { config } from '../config.js';
import { log } from '../logger.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthenticatedTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  tenant?: AuthenticatedTenant;
  memberRole?: 'owner' | 'admin' | 'staff';
  correlationId?: string;
  rawBody?: Buffer;
}

export function correlationIdMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'corr_' + Math.random().toString(36).substring(2, 10);
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header with Bearer token',
      });
      return;
    }

    const token = authHeader.substring(7);
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    } catch {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired access token',
      });
      return;
    }

    const db = getDatabase();
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User account not found',
      });
      return;
    }

    // Resolve tenant membership server-side.
    // If client supplied 'x-tenant-id', we verify the user is an authorized member of it.
    // Otherwise, we default to the user's primary/first tenant.
    const userTenants = await db.getUserTenants(user.id);
    if (userTenants.length === 0) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'User is not assigned to any active tenant account',
      });
      return;
    }

    const requestedTenantId = req.headers['x-tenant-id'] as string | undefined;
    let selected = userTenants[0];

    if (requestedTenantId) {
      const match = userTenants.find((t) => t.tenant.id === requestedTenantId);
      if (!match) {
        log('warn', 'Unauthorized tenant switch attempt rejected', {
          correlationId: req.correlationId,
          details: { requestedTenantId, userId: user.id },
        });
        res.status(403).json({
          error: 'Forbidden',
          message: 'You are not authorized to access the requested tenant account',
        });
        return;
      }
      selected = match;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    req.tenant = {
      id: selected.tenant.id,
      name: selected.tenant.name,
      slug: selected.tenant.slug,
      status: selected.tenant.status,
    };
    req.memberRole = selected.role as 'owner' | 'admin' | 'staff';

    next();
  } catch (err) {
    log('error', 'Error in requireAuth middleware', {
      correlationId: req.correlationId,
      err,
    });
    res.status(500).json({ error: 'InternalServerError', message: 'Authentication verification failure' });
  }
}

export function requireRole(allowedRoles: ('owner' | 'admin' | 'staff')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.memberRole || !allowedRoles.includes(req.memberRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}

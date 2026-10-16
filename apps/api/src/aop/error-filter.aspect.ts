/**
 * Global AOP Exception Filter Aspect
 * Intercepts all unhandled errors and domain exceptions, returning RFC 7807 compliant responses.
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-errors.js';
import { log } from '../logger.js';

export function globalErrorFilterAspect(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = (req as any).correlationId || 'unknown';
  const tenantId = (req as any).tenantId;

  const isDomainError = err instanceof AppError;
  const statusCode = isDomainError ? err.statusCode : 500;
  const errorName = isDomainError ? err.name : 'InternalServerError';
  const message = isDomainError ? err.message : 'An internal server error occurred';

  // Structured Log with redaction
  log('error', `[AOP Exception] ${req.method} ${req.path} -> ${statusCode}: ${err.message}`, {
    correlationId,
    tenantId,
    err,
    details: isDomainError && err.details ? (err.details as Record<string, unknown>) : undefined,
  });

  // RFC 7807 Problem Details Response
  res.status(statusCode).json({
    type: `https://callivaan.com/errors/${errorName}`,
    title: message,
    status: statusCode,
    correlationId,
    details: isDomainError ? err.details : undefined,
    timestamp: new Date().toISOString(),
  });
}

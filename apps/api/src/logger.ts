/**
 * Structured Logger with Correlation ID and PII Redaction
 * Strictly enforces docs/rules.md: no raw tokens, passwords, or full caller PII.
 */
import { redactSensitiveData } from '@callivaan/shared';

export interface LogPayload {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  correlationId?: string;
  tenantId?: string;
  details?: Record<string, unknown>;
  error?: string;
  stack?: string;
  timestamp: string;
}

export function log(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: {
    correlationId?: string;
    tenantId?: string;
    details?: Record<string, unknown>;
    err?: unknown;
  }
) {
  const safeDetails = context?.details ? (redactSensitiveData(context.details) as Record<string, unknown>) : undefined;

  const entry: LogPayload = {
    level,
    message,
    correlationId: context?.correlationId,
    tenantId: context?.tenantId,
    details: safeDetails,
    timestamp: new Date().toISOString(),
  };

  if (context?.err instanceof Error) {
    entry.error = context.err.message;
    if (process.env.NODE_ENV !== 'production') {
      entry.stack = context.err.stack;
    }
  }

  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

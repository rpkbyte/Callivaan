/**
 * Worker Structured Logger
 */
import { redactSensitiveData } from '@callivaan/shared';

export function logWorker(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: {
    jobName?: string;
    tenantId?: string;
    details?: Record<string, unknown>;
    err?: unknown;
  }
) {
  const safeDetails = context?.details ? (redactSensitiveData(context.details) as Record<string, unknown>) : undefined;

  const entry = {
    level,
    message,
    jobName: context?.jobName,
    tenantId: context?.tenantId,
    details: safeDetails,
    timestamp: new Date().toISOString(),
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

/**
 * Media Gateway Structured Logger
 * Conforms to docs/rules.md: logs MUST NOT contain raw audio payloads or access tokens.
 */
import { redactSensitiveData } from '@callivaan/shared';

export function logMedia(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: {
    callSid?: string;
    streamSid?: string;
    tenantId?: string;
    details?: Record<string, unknown>;
    err?: unknown;
  }
) {
  const safeDetails = context?.details ? (redactSensitiveData(context.details) as Record<string, unknown>) : undefined;

  const entry = {
    level,
    message,
    callSid: context?.callSid,
    streamSid: context?.streamSid,
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

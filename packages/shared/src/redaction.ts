/**
 * PII and Secret Redaction Utilities
 * Conforms to docs/rules.md: logs and telemetry must redact phone numbers, tokens, and media payloads.
 */

export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return 'Unknown';
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '****';
  const visiblePrefix = cleaned.slice(0, Math.min(4, cleaned.length - 2));
  const visibleSuffix = cleaned.slice(-2);
  const maskedMiddle = '*'.repeat(Math.max(2, cleaned.length - visiblePrefix.length - visibleSuffix.length));
  return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
}

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Redact Bearer tokens
    let sanitized = data.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED_TOKEN]');
    // Redact potential passwords / secrets
    sanitized = sanitized.replace(/(password|secret|token|apiKey|api_key)=['"][^'"]+['"]/gi, '$1=[REDACTED]');
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('password') ||
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('apikey') ||
        lower.includes('api_key') ||
        lower.includes('authorization')
      ) {
        copy[key] = '[REDACTED_SECRET]';
      } else if (lower.includes('payload') && typeof value === 'string' && value.length > 100) {
        copy[key] = `[MEDIA_PAYLOAD_REDACTED_${value.length}_BYTES]`;
      } else if (lower.includes('phone') && typeof value === 'string') {
        copy[key] = maskPhoneNumber(value);
      } else {
        copy[key] = redactSensitiveData(value);
      }
    }
    return copy;
  }

  return data;
}

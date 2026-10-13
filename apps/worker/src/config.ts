/**
 * Worker Service Configuration
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  webBaseUrl: process.env.WEB_BASE_URL || 'http://localhost:3000',
  retentionDays: parseInt(process.env.DEFAULT_RETENTION_DAYS || '90', 10),
  pollIntervalMs: 5000,
};

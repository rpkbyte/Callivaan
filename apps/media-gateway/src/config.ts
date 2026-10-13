/**
 * Media Gateway Configuration
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.MEDIA_PORT || '4001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  telephonyProvider: process.env.TELEPHONY_PROVIDER || 'mock',
  voiceAiProvider: process.env.VOICE_AI_PROVIDER || 'mock',
  voiceAiTimeoutMs: parseInt(process.env.VOICE_AI_TIMEOUT_MS || '15000', 10),
  maxCallDurationSeconds: parseInt(process.env.VOICE_AI_MAX_CALL_DURATION_SECONDS || '300', 10),
};

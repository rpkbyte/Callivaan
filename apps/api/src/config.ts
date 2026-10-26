/**
 * API Service Configuration
 */
const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'callivaan_dev_jwt_secret_32_characters_minimum_entropy!';

if (env === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('callivaan_dev_jwt_secret'))) {
  throw new Error('FATAL: A secure, non-default JWT_SECRET environment variable is required in production.');
}

export const config = {
  env,
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),
  mediaBaseUrl: process.env.MEDIA_BASE_URL || 'ws://localhost:4001',
  exotelWebhookSecret: process.env.EXOTEL_WEBHOOK_SECRET || 'dev_exotel_secret',
  whatsappAppSecret: process.env.WHATSAPP_APP_SECRET || 'dev_whatsapp_secret',
  whatsappVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'callivaan_wa_verify_token',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_razorpay_secret',
};


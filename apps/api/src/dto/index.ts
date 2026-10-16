/**
 * Central Data Transfer Object (DTO) Schemas using Zod
 */
import { z } from 'zod';

export const indianPhoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number. Expected format: +919876543210');

// 1. Auth DTOs
export const registerTenantSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  phoneNumber: indianPhoneSchema,
  category: z.enum([
    'automotive_dealership',
    'real_estate',
    'hospital_clinic',
    'repair_service',
    'salon_spa',
    'general',
  ]).optional().default('general'),
});
export type RegisterTenantDto = z.infer<typeof registerTenantSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const switchTenantSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
});
export type SwitchTenantDto = z.infer<typeof switchTenantSchema>;

// 2. Agent Config DTOs
export const updateAgentConfigSchema = z.object({
  settings: z.record(z.unknown()),
  changeNote: z.string().optional(),
});
export type UpdateAgentConfigDto = z.infer<typeof updateAgentConfigSchema>;

export const rollbackAgentConfigSchema = z.object({
  targetVersion: z.number().int().positive('Target version must be a positive integer'),
  reason: z.string().optional(),
});
export type RollbackAgentConfigDto = z.infer<typeof rollbackAgentConfigSchema>;

// 3. Telephony Route DTOs
export const updateRouteSchema = z.object({
  fallbackBehavior: z.enum(['transfer_to_human', 'voicemail', 'announcement_hangup']).optional(),
  customerOriginalNumber: indianPhoneSchema.optional(),
  carrier: z.enum(['jio', 'airtel', 'vi', 'bsnl']).optional(),
  forwardingMode: z.enum(['unconditional', 'busy_no_answer']).optional(),
  ringTimeoutSeconds: z.number().int().min(5).max(60).optional(),
});
export type UpdateRouteDto = z.infer<typeof updateRouteSchema>;

// 4. WhatsApp DTOs
export const whatsAppPairingSchema = z.object({
  whatsappPhoneNumber: indianPhoneSchema,
});
export type WhatsAppPairingDto = z.infer<typeof whatsAppPairingSchema>;

export const verifyPairingCodeSchema = z.object({
  pairingCode: z.string().length(6, 'Pairing code must be 6 digits'),
  whatsappPhoneNumber: indianPhoneSchema,
});
export type VerifyPairingCodeDto = z.infer<typeof verifyPairingCodeSchema>;

export const updateWhatsAppOptInsSchema = z.object({
  optIns: z.object({
    callSummaries: z.boolean().optional(),
    urgentAlerts: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
  }),
});
export type UpdateWhatsAppOptInsDto = z.infer<typeof updateWhatsAppOptInsSchema>;

// 5. Billing & Subscription DTOs
export const upgradePlanSchema = z.object({
  planId: z.enum(['trial', 'personal', 'pro', 'growth', 'enterprise']),
});
export type UpgradePlanDto = z.infer<typeof upgradePlanSchema>;

/**
 * Zod Validation Schemas for Callivaan
 */
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.enum(['repair_service', 'salon_spa', 'property_agent', 'clinic_healthcare', 'custom']),
  phoneNumber: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const OperatingHoursDaySchema = z.object({
  open: z.string().default('09:00'),
  close: z.string().default('19:00'),
  closed: z.boolean().optional().default(false),
});

export const BusinessProfileUpdateSchema = z.object({
  businessName: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.enum(['repair_service', 'salon_spa', 'property_agent', 'clinic_healthcare', 'custom']).optional(),
  languages: z.array(z.enum(['en', 'hi', 'hi-en'])).optional(),
  primaryLanguage: z.enum(['en', 'hi', 'hi-en']).optional(),
  operatingHours: z.record(OperatingHoursDaySchema).optional(),
  serviceArea: z.string().optional(),
  escalationPhoneNumber: z.string().optional(),
});

export const AgentSettingsSchema = z.object({
  greeting: z.string().min(5, 'Greeting must be at least 5 characters'),
  language: z.enum(['en', 'hi', 'hi-en']),
  tone: z.enum(['professional', 'warm', 'concise']),
  businessFacts: z.array(z.string().min(1)),
  faqs: z.array(
    z.object({
      question: z.string().min(2),
      answer: z.string().min(2),
    })
  ),
  collectFields: z.object({
    callerName: z.boolean(),
    callbackNumber: z.boolean(),
    serviceNeeded: z.boolean(),
    preferredTime: z.boolean(),
    urgency: z.boolean(),
  }),
  prohibitedCommitments: z.array(z.string()),
  fallbackMessage: z.string().min(5),
  aiDisclosureEnabled: z.boolean().default(true),
  maxCallDurationSeconds: z.number().int().min(30).max(600).default(300),
});

export const CreateAgentConfigSchema = z.object({
  settings: AgentSettingsSchema,
  changeNote: z.string().optional(),
  activateImmediately: z.boolean().optional().default(true),
});

export const PhoneRouteSetupSchema = z.object({
  customerOriginalNumber: z.string().optional(),
  fallbackBehavior: z.enum(['voicemail', 'forward_to_escalation', 'announcement_hangup']).default('announcement_hangup'),
});

export const WhatsAppPairingRequestSchema = z.object({
  whatsappPhoneNumber: z.string().min(10, 'Valid WhatsApp phone number required'),
});

export const WhatsAppOptInUpdateSchema = z.object({
  callSummaries: z.boolean().optional(),
  urgentAlerts: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
});

export const CheckoutSessionRequestSchema = z.object({
  planId: z.enum(['trial', 'personal', 'business', 'team']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
});

// Telephony Provider Webhook Schemas (Exotel)
export const ExotelIncomingCallWebhookSchema = z.object({
  CallSid: z.string(),
  From: z.string(),
  To: z.string(),
  CallType: z.string().optional(),
  Direction: z.string().optional(),
  Created: z.string().optional(),
  CurrentTime: z.string().optional(),
});

export const ExotelStreamEventSchema = z.object({
  event: z.enum(['connected', 'start', 'media', 'mark', 'clear', 'stop']),
  streamSid: z.string().optional(),
  callSid: z.string().optional(),
  media: z
    .object({
      payload: z.string(),
      timestamp: z.string().optional(),
    })
    .optional(),
  start: z
    .object({
      streamSid: z.string(),
      callSid: z.string(),
      accountSid: z.string().optional(),
      customParameters: z.record(z.string()).optional(),
    })
    .optional(),
});

// WhatsApp Cloud API Inbound Message Webhook Schema
export const WhatsAppInboundWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal('whatsapp'),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z
              .array(
                z.object({
                  profile: z.object({ name: z.string() }),
                  wa_id: z.string(),
                })
              )
              .optional(),
            messages: z
              .array(
                z.object({
                  from: z.string(),
                  id: z.string(),
                  timestamp: z.string(),
                  type: z.string(),
                  text: z.object({ body: z.string() }).optional(),
                  button: z.object({ text: z.string(), payload: z.string().optional() }).optional(),
                })
              )
              .optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

// Razorpay Webhook Schema
export const RazorpayWebhookSchema = z.object({
  entity: z.string(),
  account_id: z.string(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.record(z.any()),
  created_at: z.number(),
});

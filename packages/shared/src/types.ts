/**
 * Callivaan Core Types and Contracts
 */

export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  countryCode: string; // e.g. 'IN'
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  updatedAt: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  tenantId: string;
  businessName: string;
  category: 'repair_service' | 'salon_spa' | 'property_agent' | 'clinic_healthcare' | 'custom';
  description: string;
  languages: ('en' | 'hi' | 'hi-en')[];
  primaryLanguage: 'en' | 'hi' | 'hi-en';
  operatingHours: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  serviceArea?: string;
  escalationPhoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSettings {
  greeting: string;
  language: 'en' | 'hi' | 'hi-en';
  tone: 'professional' | 'warm' | 'concise';
  businessFacts: string[];
  faqs: { question: string; answer: string }[];
  collectFields: {
    callerName: boolean;
    callbackNumber: boolean;
    serviceNeeded: boolean;
    preferredTime: boolean;
    urgency: boolean;
  };
  prohibitedCommitments: string[];
  fallbackMessage: string;
  aiDisclosureEnabled: boolean;
  maxCallDurationSeconds: number;
}

export interface AgentConfigVersion {
  id: string;
  tenantId: string;
  versionNumber: number;
  settings: AgentSettings;
  isActive: boolean;
  changeSource: 'web' | 'mobile' | 'whatsapp' | 'system_init';
  changedByUserId?: string;
  changeNote?: string;
  activatedAt?: string;
  createdAt: string;
}

export type RouteStatus = 'pending_setup' | 'verified' | 'active' | 'error';
export type FallbackBehavior = 'voicemail' | 'forward_to_escalation' | 'announcement_hangup';

export interface PhoneRoute {
  id: string;
  tenantId: string;
  provider: 'exotel' | 'mock';
  providerVirtualNumber: string; // ExoPhone
  customerOriginalNumber?: string;
  status: RouteStatus;
  fallbackBehavior: FallbackBehavior;
  callForwardingSetupCode?: string; // e.g. *21*<virtualNumber>#
  verifiedAt?: string;
  lastTestCallAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CallOutcome =
  | 'in_progress'
  | 'completed'
  | 'callback_requested'
  | 'human_fallback'
  | 'caller_disconnected'
  | 'limit_reached'
  | 'technical_failure';

export interface Call {
  id: string;
  tenantId: string;
  providerCallId: string;
  providerStreamId?: string;
  callerNumber: string;
  virtualNumber: string;
  agentConfigVersionId: string;
  status: CallOutcome;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  costEstimateInr?: number;
  createdAt: string;
}

export interface ExtractedLead {
  callerName?: string;
  callbackNumber?: string;
  requestedService?: string;
  preferredTime?: string;
  urgency?: 'low' | 'normal' | 'urgent';
  followUpAction?: string;
  notes?: string;
}

export interface CallSummary {
  id: string;
  callId: string;
  tenantId: string;
  summaryText: string;
  extractedLead: ExtractedLead;
  isUnknownFlags: {
    callerNameUnknown: boolean;
    preferredTimeUnknown: boolean;
    serviceNeededUnknown: boolean;
    urgencyUnknown: boolean;
  };
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'not_eligible';
  deliveredViaWhatsAppAt?: string;
  createdAt: string;
}

export interface WhatsAppOptIns {
  callSummaries: boolean;
  urgentAlerts: boolean;
  productUpdates: boolean;
}

export interface WhatsAppLink {
  id: string;
  tenantId: string;
  whatsappPhoneNumber: string;
  isVerified: boolean;
  pairingCode?: string;
  pairingCodeExpiresAt?: string;
  pairedAt?: string;
  optIns: WhatsAppOptIns;
  optedOutAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppProposal {
  id: string;
  tenantId: string;
  senderWhatsAppNumber: string;
  rawUserMessage: string;
  proposedPatch: Partial<AgentSettings>;
  humanReadableSummary: string;
  requiresClarification: boolean;
  clarificationPrompt?: string;
  status: 'pending_confirmation' | 'confirmed' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export type PlanId = 'trial' | 'personal' | 'business' | 'team';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceMonthlyInr: number;
  includedMinutes: number;
  overageRatePerMinuteInr: number;
  maxAgents: number;
  features: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLedger {
  id: string;
  tenantId: string;
  periodYearMonth: string; // '2026-10'
  telephonyMinutesUsed: number;
  aiUnitsUsed: number;
  whatsappMessagesSent: number;
  includedMinutes: number;
  overageMinutes: number;
  estimatedOverageCostInr: number;
  isHardLimitReached: boolean;
  lastUpdated: string;
}

export interface AuditEvent {
  id: string;
  tenantId?: string;
  actorId: string;
  actorType: 'user' | 'system' | 'whatsapp' | 'admin';
  action: string;
  targetEntity: string;
  targetEntityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

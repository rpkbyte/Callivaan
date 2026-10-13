/**
 * Callivaan Database Repository Interface and Implementations
 * Strictly enforces tenant isolation on all queries.
 */
import {
  User,
  Tenant,
  TenantMember,
  BusinessProfile,
  AgentConfigVersion,
  AgentSettings,
  PhoneRoute,
  Call,
  CallSummary,
  UsageLedger,
  Subscription,
  WhatsAppLink,
  WhatsAppProposal,
  AuditEvent,
  PlanId,
} from '@callivaan/shared';

export interface DatabaseRepository {
  // User & Auth
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<User>;
  getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;

  // Tenants & Memberships
  createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>, ownerUserId: string): Promise<Tenant>;
  getTenantById(tenantId: string): Promise<Tenant | null>;
  getUserTenants(userId: string): Promise<{ tenant: Tenant; role: string }[]>;
  getTenantMember(tenantId: string, userId: string): Promise<TenantMember | null>;

  // Business Profiles
  getBusinessProfile(tenantId: string): Promise<BusinessProfile | null>;
  upsertBusinessProfile(tenantId: string, profile: Partial<BusinessProfile>): Promise<BusinessProfile>;

  // Agent Configurations & Versions
  getActiveAgentConfig(tenantId: string): Promise<AgentConfigVersion | null>;
  getAgentConfigVersions(tenantId: string): Promise<AgentConfigVersion[]>;
  createAgentConfigVersion(tenantId: string, params: {
    settings: AgentSettings;
    changeSource: 'web' | 'mobile' | 'whatsapp' | 'system_init';
    changedByUserId?: string;
    changeNote?: string;
    activateImmediately?: boolean;
  }): Promise<AgentConfigVersion>;
  activateAgentConfigVersion(tenantId: string, versionId: string): Promise<AgentConfigVersion | null>;
  getAgentConfigById(tenantId: string, versionId: string): Promise<AgentConfigVersion | null>;

  // Phone Routes
  getPhoneRoute(tenantId: string): Promise<PhoneRoute | null>;
  getPhoneRouteByVirtualNumber(virtualNumber: string): Promise<PhoneRoute | null>;
  upsertPhoneRoute(tenantId: string, params: Partial<PhoneRoute>): Promise<PhoneRoute>;

  // Calls
  createCall(call: Omit<Call, 'createdAt'>): Promise<Call>;
  getCallById(tenantId: string, callId: string): Promise<Call | null>;
  getCallByProviderCallId(providerCallId: string): Promise<Call | null>;
  updateCall(tenantId: string, callId: string, updates: Partial<Call>): Promise<Call | null>;
  listCalls(tenantId: string, limit?: number, offset?: number): Promise<{ calls: Call[]; total: number }>;
  deleteCall(tenantId: string, callId: string): Promise<boolean>;

  // Call Summaries
  createCallSummary(summary: Omit<CallSummary, 'createdAt'>): Promise<CallSummary>;
  getCallSummary(tenantId: string, callId: string): Promise<CallSummary | null>;
  updateCallSummary(tenantId: string, callId: string, updates: Partial<CallSummary>): Promise<CallSummary | null>;

  // WhatsApp Links & Preferences
  getWhatsAppLink(tenantId: string): Promise<WhatsAppLink | null>;
  getWhatsAppLinkByPhone(whatsappPhone: string): Promise<WhatsAppLink | null>;
  createOrUpdateWhatsAppPairing(tenantId: string, whatsappPhone: string, pairingCode: string, expiresAt: string): Promise<WhatsAppLink>;
  verifyWhatsAppLink(pairingCode: string, whatsappPhone: string): Promise<WhatsAppLink | null>;
  updateWhatsAppOptIns(tenantId: string, optIns: Partial<WhatsAppLink['optIns']>): Promise<WhatsAppLink | null>;
  setWhatsAppOptOut(whatsappPhone: string): Promise<boolean>;

  // WhatsApp Configuration Proposals
  createWhatsAppProposal(proposal: Omit<WhatsAppProposal, 'id' | 'createdAt'>): Promise<WhatsAppProposal>;
  getPendingWhatsAppProposal(tenantId: string, senderPhone: string): Promise<WhatsAppProposal | null>;
  updateWhatsAppProposalStatus(id: string, status: WhatsAppProposal['status']): Promise<WhatsAppProposal | null>;

  // Usage Ledger
  getUsageLedger(tenantId: string, periodYearMonth: string): Promise<UsageLedger | null>;
  recordCallUsage(tenantId: string, durationSeconds: number, aiUnits?: number): Promise<UsageLedger>;
  recordWhatsAppMessageUsage(tenantId: string): Promise<UsageLedger>;

  // Subscriptions
  getSubscription(tenantId: string): Promise<Subscription | null>;
  upsertSubscription(tenantId: string, params: { planId: PlanId; status?: Subscription['status']; providerSubscriptionId?: string }): Promise<Subscription>;

  // Webhook Idempotency
  checkAndRecordWebhookEvent(provider: string, externalEventId: string, eventType: string, payload: unknown): Promise<{ isDuplicate: boolean; eventId: string }>;
  markWebhookProcessed(eventId: string, errorMessage?: string): Promise<void>;

  // Audit Events
  recordAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<AuditEvent>;
  listAuditEvents(tenantId: string, limit?: number): Promise<AuditEvent[]>;
}

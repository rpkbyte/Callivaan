/**
 * In-Memory Database Repository Implementation
 * Provides zero-dependency, lightning-fast execution for development and automated testing.
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
  STARTER_PRESETS,
  STANDARD_PLANS,
} from '@callivaan/shared';
import { DatabaseRepository } from './repository.js';

function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export class MemoryDatabaseRepository implements DatabaseRepository {
  private users = new Map<string, User & { passwordHash: string }>();
  private tenants = new Map<string, Tenant>();
  private tenantMembers: TenantMember[] = [];
  private businessProfiles = new Map<string, BusinessProfile>(); // tenantId -> profile
  private agentConfigs: AgentConfigVersion[] = [];
  private phoneRoutes = new Map<string, PhoneRoute>(); // tenantId -> route
  private whatsAppLinks = new Map<string, WhatsAppLink>(); // tenantId -> link
  private whatsAppProposals: WhatsAppProposal[] = [];
  private calls: Call[] = [];
  private callSummaries = new Map<string, CallSummary>(); // callId -> summary
  private usageLedgers: UsageLedger[] = [];
  private subscriptions = new Map<string, Subscription>(); // tenantId -> subscription
  private webhookEvents = new Map<string, { id: string; provider: string; externalEventId: string; status: string; processedAt?: string; error?: string }>();
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed initial demo data for local review and automated tests
    const demoUserId = 'usr_demo_owner';
    const demoTenantId = 'ten_callivaan_demo';

    const now = new Date().toISOString();

    const demoUser: User & { passwordHash: string } = {
      id: demoUserId,
      email: 'owner@callivaan.demo',
      // password is 'password123'
      passwordHash: '$2a$10$WuuWmQFXU/2uoSkKjiEsOuO32DFdZN29u/ATXeIUHpYVzdqrvRyr2',
      fullName: 'Rahul Sharma',
      phoneNumber: '+919876543210',
      emailVerified: true,
      phoneVerified: true,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(demoUser.id, demoUser);

    const demoTenant: Tenant = {
      id: demoTenantId,
      name: 'Sharma Appliances & Repair',
      slug: 'sharma-appliances',
      timezone: 'Asia/Kolkata',
      countryCode: 'IN',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.tenants.set(demoTenant.id, demoTenant);

    this.tenantMembers.push({
      id: generateId(),
      tenantId: demoTenantId,
      userId: demoUserId,
      role: 'owner',
      createdAt: now,
    });

    const demoProfile: BusinessProfile = {
      id: generateId(),
      tenantId: demoTenantId,
      businessName: 'Sharma Appliances & Repair',
      category: 'repair_service',
      description: 'Expert home appliances repair service in South Delhi and NCR.',
      languages: ['hi-en', 'hi', 'en'],
      primaryLanguage: 'hi-en',
      operatingHours: {
        monday: { open: '09:00', close: '20:00', closed: false },
        tuesday: { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday: { open: '09:00', close: '20:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: false },
      },
      serviceArea: 'South Delhi, Dwarka, Noida Sector 18',
      escalationPhoneNumber: '+919876543210',
      createdAt: now,
      updatedAt: now,
    };
    this.businessProfiles.set(demoTenantId, demoProfile);

    // Initial agent config (version 1)
    const preset = STARTER_PRESETS['repair_service'].settings;
    const initialConfig: AgentConfigVersion = {
      id: generateId(),
      tenantId: demoTenantId,
      versionNumber: 1,
      settings: preset,
      isActive: true,
      changeSource: 'system_init',
      changedByUserId: demoUserId,
      changeNote: 'Initial setup with Repair Service vertical preset',
      activatedAt: now,
      createdAt: now,
    };
    this.agentConfigs.push(initialConfig);

    // Demo Phone Route
    const demoRoute: PhoneRoute = {
      id: generateId(),
      tenantId: demoTenantId,
      provider: 'exotel',
      providerVirtualNumber: '+918047192000',
      customerOriginalNumber: '+919876543210',
      status: 'active',
      fallbackBehavior: 'announcement_hangup',
      callForwardingSetupCode: '*21*+918047192000#',
      verifiedAt: now,
      lastTestCallAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.phoneRoutes.set(demoTenantId, demoRoute);

    // Demo WhatsApp link
    const demoWaLink: WhatsAppLink = {
      id: generateId(),
      tenantId: demoTenantId,
      whatsappPhoneNumber: '+919876543210',
      isVerified: true,
      pairedAt: now,
      optIns: {
        callSummaries: true,
        urgentAlerts: true,
        productUpdates: false,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.whatsAppLinks.set(demoTenantId, demoWaLink);

    // Demo Subscription (Personal Plan)
    const demoSub: Subscription = {
      id: generateId(),
      tenantId: demoTenantId,
      planId: 'personal',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      providerSubscriptionId: 'sub_demo_12345',
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptions.set(demoTenantId, demoSub);

    // Demo Usage Ledger
    const currentMonth = new Date().toISOString().substring(0, 7);
    this.usageLedgers.push({
      id: generateId(),
      tenantId: demoTenantId,
      periodYearMonth: currentMonth,
      telephonyMinutesUsed: 24,
      aiUnitsUsed: 24,
      whatsappMessagesSent: 8,
      includedMinutes: 150,
      overageMinutes: 0,
      estimatedOverageCostInr: 0,
      isHardLimitReached: false,
      lastUpdated: now,
    });
  }

  // User & Auth
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<User> {
    const existing = await this.getUserByEmail(user.email);
    if (existing) {
      throw new Error(`User with email ${user.email} already exists`);
    }
    const now = new Date().toISOString();
    const newUser: User & { passwordHash: string } = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(newUser.id, newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const lower = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === lower) {
        return { ...user };
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  // Tenants & Memberships
  async createTenant(tenant: Omit<Tenant, 'createdAt' | 'updatedAt'>, ownerUserId: string): Promise<Tenant> {
    const now = new Date().toISOString();
    const newTenant: Tenant = {
      ...tenant,
      createdAt: now,
      updatedAt: now,
    };
    this.tenants.set(newTenant.id, newTenant);

    this.tenantMembers.push({
      id: generateId(),
      tenantId: newTenant.id,
      userId: ownerUserId,
      role: 'owner',
      createdAt: now,
    });

    return newTenant;
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  async getUserTenants(userId: string): Promise<{ tenant: Tenant; role: string }[]> {
    const memberships = this.tenantMembers.filter((m) => m.userId === userId);
    const result: { tenant: Tenant; role: string }[] = [];
    for (const m of memberships) {
      const t = this.tenants.get(m.tenantId);
      if (t) {
        result.push({ tenant: t, role: m.role });
      }
    }
    return result;
  }

  async getTenantMember(tenantId: string, userId: string): Promise<TenantMember | null> {
    const member = this.tenantMembers.find((m) => m.tenantId === tenantId && m.userId === userId);
    return member || null;
  }

  // Business Profiles
  async getBusinessProfile(tenantId: string): Promise<BusinessProfile | null> {
    return this.businessProfiles.get(tenantId) || null;
  }

  async upsertBusinessProfile(tenantId: string, profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const existing = this.businessProfiles.get(tenantId);
    const now = new Date().toISOString();
    if (existing) {
      const updated: BusinessProfile = {
        ...existing,
        ...profile,
        updatedAt: now,
      };
      this.businessProfiles.set(tenantId, updated);
      return updated;
    } else {
      const newProfile: BusinessProfile = {
        id: generateId(),
        tenantId,
        businessName: profile.businessName || 'Business Name',
        category: profile.category || 'repair_service',
        description: profile.description || '',
        languages: profile.languages || ['hi-en', 'en', 'hi'],
        primaryLanguage: profile.primaryLanguage || 'hi-en',
        operatingHours: profile.operatingHours || {},
        serviceArea: profile.serviceArea || '',
        escalationPhoneNumber: profile.escalationPhoneNumber,
        createdAt: now,
        updatedAt: now,
      };
      this.businessProfiles.set(tenantId, newProfile);
      return newProfile;
    }
  }

  // Agent Configurations & Versions
  async getActiveAgentConfig(tenantId: string): Promise<AgentConfigVersion | null> {
    const active = this.agentConfigs.find((c) => c.tenantId === tenantId && c.isActive);
    return active ? { ...active } : null;
  }

  async getAgentConfigVersions(tenantId: string): Promise<AgentConfigVersion[]> {
    return this.agentConfigs
      .filter((c) => c.tenantId === tenantId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async createAgentConfigVersion(
    tenantId: string,
    params: {
      settings: AgentSettings;
      changeSource: 'web' | 'mobile' | 'whatsapp' | 'system_init';
      changedByUserId?: string;
      changeNote?: string;
      activateImmediately?: boolean;
    }
  ): Promise<AgentConfigVersion> {
    const existingVersions = this.agentConfigs.filter((c) => c.tenantId === tenantId);
    const nextVersionNumber = existingVersions.length > 0 ? Math.max(...existingVersions.map((v) => v.versionNumber)) + 1 : 1;
    const now = new Date().toISOString();

    if (params.activateImmediately) {
      for (const config of this.agentConfigs) {
        if (config.tenantId === tenantId) {
          config.isActive = false;
        }
      }
    }

    const newConfig: AgentConfigVersion = {
      id: generateId(),
      tenantId,
      versionNumber: nextVersionNumber,
      settings: params.settings,
      isActive: !!params.activateImmediately,
      changeSource: params.changeSource,
      changedByUserId: params.changedByUserId,
      changeNote: params.changeNote,
      activatedAt: params.activateImmediately ? now : undefined,
      createdAt: now,
    };
    this.agentConfigs.push(newConfig);
    return { ...newConfig };
  }

  async activateAgentConfigVersion(tenantId: string, versionId: string): Promise<AgentConfigVersion | null> {
    const target = this.agentConfigs.find((c) => c.tenantId === tenantId && c.id === versionId);
    if (!target) return null;

    const now = new Date().toISOString();
    for (const c of this.agentConfigs) {
      if (c.tenantId === tenantId) {
        c.isActive = c.id === versionId;
        if (c.isActive) c.activatedAt = now;
      }
    }
    return { ...target };
  }

  async getAgentConfigById(tenantId: string, versionId: string): Promise<AgentConfigVersion | null> {
    const config = this.agentConfigs.find((c) => c.tenantId === tenantId && c.id === versionId);
    return config ? { ...config } : null;
  }

  // Phone Routes
  async getPhoneRoute(tenantId: string): Promise<PhoneRoute | null> {
    return this.phoneRoutes.get(tenantId) || null;
  }

  async getPhoneRouteByVirtualNumber(virtualNumber: string): Promise<PhoneRoute | null> {
    for (const route of this.phoneRoutes.values()) {
      if (route.providerVirtualNumber === virtualNumber) {
        return { ...route };
      }
    }
    return null;
  }

  async upsertPhoneRoute(tenantId: string, params: Partial<PhoneRoute>): Promise<PhoneRoute> {
    const existing = this.phoneRoutes.get(tenantId);
    const now = new Date().toISOString();
    if (existing) {
      const updated: PhoneRoute = {
        ...existing,
        ...params,
        updatedAt: now,
      };
      this.phoneRoutes.set(tenantId, updated);
      return updated;
    } else {
      const newRoute: PhoneRoute = {
        id: generateId(),
        tenantId,
        provider: params.provider || 'exotel',
        providerVirtualNumber: params.providerVirtualNumber || '+918047192000',
        customerOriginalNumber: params.customerOriginalNumber,
        status: params.status || 'pending_setup',
        fallbackBehavior: params.fallbackBehavior || 'announcement_hangup',
        callForwardingSetupCode: `*21*${params.providerVirtualNumber || '+918047192000'}#`,
        verifiedAt: params.verifiedAt,
        lastTestCallAt: params.lastTestCallAt,
        createdAt: now,
        updatedAt: now,
      };
      this.phoneRoutes.set(tenantId, newRoute);
      return newRoute;
    }
  }

  // Calls
  async createCall(call: Omit<Call, 'createdAt'>): Promise<Call> {
    const newCall: Call = {
      ...call,
      createdAt: new Date().toISOString(),
    };
    this.calls.push(newCall);
    return { ...newCall };
  }

  async getCallById(tenantId: string, callId: string): Promise<Call | null> {
    const call = this.calls.find((c) => c.tenantId === tenantId && c.id === callId);
    return call ? { ...call } : null;
  }

  async getCallByProviderCallId(providerCallId: string): Promise<Call | null> {
    const call = this.calls.find((c) => c.providerCallId === providerCallId);
    return call ? { ...call } : null;
  }

  async updateCall(tenantId: string, callId: string, updates: Partial<Call>): Promise<Call | null> {
    const callIndex = this.calls.findIndex((c) => c.tenantId === tenantId && c.id === callId);
    if (callIndex === -1) return null;
    this.calls[callIndex] = {
      ...this.calls[callIndex],
      ...updates,
    };
    return { ...this.calls[callIndex] };
  }

  async listCalls(tenantId: string, limit = 20, offset = 0): Promise<{ calls: Call[]; total: number }> {
    const tenantCalls = this.calls
      .filter((c) => c.tenantId === tenantId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return {
      calls: tenantCalls.slice(offset, offset + limit),
      total: tenantCalls.length,
    };
  }

  async deleteCall(tenantId: string, callId: string): Promise<boolean> {
    const idx = this.calls.findIndex((c) => c.tenantId === tenantId && c.id === callId);
    if (idx === -1) return false;
    this.calls.splice(idx, 1);
    this.callSummaries.delete(callId);
    return true;
  }

  // Call Summaries
  async createCallSummary(summary: Omit<CallSummary, 'createdAt'>): Promise<CallSummary> {
    const newSummary: CallSummary = {
      ...summary,
      createdAt: new Date().toISOString(),
    };
    this.callSummaries.set(summary.callId, newSummary);
    return { ...newSummary };
  }

  async getCallSummary(tenantId: string, callId: string): Promise<CallSummary | null> {
    const summary = this.callSummaries.get(callId);
    if (!summary || summary.tenantId !== tenantId) return null;
    return { ...summary };
  }

  async updateCallSummary(tenantId: string, callId: string, updates: Partial<CallSummary>): Promise<CallSummary | null> {
    const summary = this.callSummaries.get(callId);
    if (!summary || summary.tenantId !== tenantId) return null;
    const updated = { ...summary, ...updates };
    this.callSummaries.set(callId, updated);
    return { ...updated };
  }

  // WhatsApp Links
  async getWhatsAppLink(tenantId: string): Promise<WhatsAppLink | null> {
    return this.whatsAppLinks.get(tenantId) || null;
  }

  async getWhatsAppLinkByPhone(whatsappPhone: string): Promise<WhatsAppLink | null> {
    for (const link of this.whatsAppLinks.values()) {
      if (link.whatsappPhoneNumber === whatsappPhone && link.isVerified) {
        return { ...link };
      }
    }
    return null;
  }

  async createOrUpdateWhatsAppPairing(tenantId: string, whatsappPhone: string, pairingCode: string, expiresAt: string): Promise<WhatsAppLink> {
    const existing = this.whatsAppLinks.get(tenantId);
    const now = new Date().toISOString();
    if (existing) {
      const updated: WhatsAppLink = {
        ...existing,
        whatsappPhoneNumber: whatsappPhone,
        pairingCode,
        pairingCodeExpiresAt: expiresAt,
        updatedAt: now,
      };
      this.whatsAppLinks.set(tenantId, updated);
      return updated;
    } else {
      const newLink: WhatsAppLink = {
        id: generateId(),
        tenantId,
        whatsappPhoneNumber: whatsappPhone,
        isVerified: false,
        pairingCode,
        pairingCodeExpiresAt: expiresAt,
        optIns: { callSummaries: true, urgentAlerts: true, productUpdates: false },
        createdAt: now,
        updatedAt: now,
      };
      this.whatsAppLinks.set(tenantId, newLink);
      return newLink;
    }
  }

  async verifyWhatsAppLink(pairingCode: string, whatsappPhone: string): Promise<WhatsAppLink | null> {
    const now = new Date().getTime();
    for (const [tenantId, link] of this.whatsAppLinks.entries()) {
      if (
        link.pairingCode === pairingCode &&
        link.whatsappPhoneNumber === whatsappPhone &&
        link.pairingCodeExpiresAt &&
        new Date(link.pairingCodeExpiresAt).getTime() > now
      ) {
        const verified: WhatsAppLink = {
          ...link,
          isVerified: true,
          pairingCode: undefined,
          pairingCodeExpiresAt: undefined,
          pairedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.whatsAppLinks.set(tenantId, verified);
        return { ...verified };
      }
    }
    return null;
  }

  async updateWhatsAppOptIns(tenantId: string, optIns: Partial<WhatsAppLink['optIns']>): Promise<WhatsAppLink | null> {
    const link = this.whatsAppLinks.get(tenantId);
    if (!link) return null;
    const updated = {
      ...link,
      optIns: { ...link.optIns, ...optIns },
      updatedAt: new Date().toISOString(),
    };
    this.whatsAppLinks.set(tenantId, updated);
    return { ...updated };
  }

  async setWhatsAppOptOut(whatsappPhone: string): Promise<boolean> {
    let found = false;
    const now = new Date().toISOString();
    for (const [tenantId, link] of this.whatsAppLinks.entries()) {
      if (link.whatsappPhoneNumber === whatsappPhone) {
        link.optIns = { callSummaries: false, urgentAlerts: false, productUpdates: false };
        link.optedOutAt = now;
        link.updatedAt = now;
        this.whatsAppLinks.set(tenantId, link);
        found = true;
      }
    }
    return found;
  }

  // WhatsApp Proposals
  async createWhatsAppProposal(proposal: Omit<WhatsAppProposal, 'id' | 'createdAt'>): Promise<WhatsAppProposal> {
    const newProposal: WhatsAppProposal = {
      ...proposal,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.whatsAppProposals.push(newProposal);
    return { ...newProposal };
  }

  async getPendingWhatsAppProposal(tenantId: string, senderPhone: string): Promise<WhatsAppProposal | null> {
    const now = new Date().getTime();
    const proposal = this.whatsAppProposals.find(
      (p) =>
        p.tenantId === tenantId &&
        p.senderWhatsAppNumber === senderPhone &&
        p.status === 'pending_confirmation' &&
        new Date(p.expiresAt).getTime() > now
    );
    return proposal ? { ...proposal } : null;
  }

  async updateWhatsAppProposalStatus(id: string, status: WhatsAppProposal['status']): Promise<WhatsAppProposal | null> {
    const proposal = this.whatsAppProposals.find((p) => p.id === id);
    if (!proposal) return null;
    proposal.status = status;
    return { ...proposal };
  }

  // Usage Ledger
  async getUsageLedger(tenantId: string, periodYearMonth: string): Promise<UsageLedger | null> {
    const ledger = this.usageLedgers.find((l) => l.tenantId === tenantId && l.periodYearMonth === periodYearMonth);
    return ledger ? { ...ledger } : null;
  }

  async recordCallUsage(tenantId: string, durationSeconds: number, aiUnits = 1): Promise<UsageLedger> {
    const period = new Date().toISOString().substring(0, 7);
    const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    let ledger = this.usageLedgers.find((l) => l.tenantId === tenantId && l.periodYearMonth === period);

    const sub = await this.getSubscription(tenantId);
    const plan = STANDARD_PLANS.find((p) => p.id === (sub?.planId || 'trial')) || STANDARD_PLANS[0];

    const now = new Date().toISOString();
    if (!ledger) {
      ledger = {
        id: generateId(),
        tenantId,
        periodYearMonth: period,
        telephonyMinutesUsed: 0,
        aiUnitsUsed: 0,
        whatsappMessagesSent: 0,
        includedMinutes: plan.includedMinutes,
        overageMinutes: 0,
        estimatedOverageCostInr: 0,
        isHardLimitReached: false,
        lastUpdated: now,
      };
      this.usageLedgers.push(ledger);
    }

    ledger.telephonyMinutesUsed += durationMinutes;
    ledger.aiUnitsUsed += aiUnits;
    if (ledger.telephonyMinutesUsed > ledger.includedMinutes) {
      ledger.overageMinutes = ledger.telephonyMinutesUsed - ledger.includedMinutes;
      ledger.estimatedOverageCostInr = Number((ledger.overageMinutes * plan.overageRatePerMinuteInr).toFixed(2));
    }
    // Hard limit check for trial or max spend cap
    if (sub?.planId === 'trial' && ledger.telephonyMinutesUsed >= ledger.includedMinutes) {
      ledger.isHardLimitReached = true;
    }
    ledger.lastUpdated = now;
    return { ...ledger };
  }

  async recordWhatsAppMessageUsage(tenantId: string): Promise<UsageLedger> {
    const period = new Date().toISOString().substring(0, 7);
    let ledger = this.usageLedgers.find((l) => l.tenantId === tenantId && l.periodYearMonth === period);
    const now = new Date().toISOString();
    if (!ledger) {
      ledger = {
        id: generateId(),
        tenantId,
        periodYearMonth: period,
        telephonyMinutesUsed: 0,
        aiUnitsUsed: 0,
        whatsappMessagesSent: 0,
        includedMinutes: 30,
        overageMinutes: 0,
        estimatedOverageCostInr: 0,
        isHardLimitReached: false,
        lastUpdated: now,
      };
      this.usageLedgers.push(ledger);
    }
    ledger.whatsappMessagesSent += 1;
    ledger.lastUpdated = now;
    return { ...ledger };
  }

  // Subscriptions
  async getSubscription(tenantId: string): Promise<Subscription | null> {
    return this.subscriptions.get(tenantId) || null;
  }

  async upsertSubscription(
    tenantId: string,
    params: { planId: PlanId; status?: Subscription['status']; providerSubscriptionId?: string }
  ): Promise<Subscription> {
    const existing = this.subscriptions.get(tenantId);
    const now = new Date().toISOString();
    if (existing) {
      const updated: Subscription = {
        ...existing,
        planId: params.planId,
        status: params.status || existing.status,
        providerSubscriptionId: params.providerSubscriptionId || existing.providerSubscriptionId,
        updatedAt: now,
      };
      this.subscriptions.set(tenantId, updated);
      return updated;
    } else {
      const newSub: Subscription = {
        id: generateId(),
        tenantId,
        planId: params.planId,
        status: params.status || 'active',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        providerSubscriptionId: params.providerSubscriptionId,
        createdAt: now,
        updatedAt: now,
      };
      this.subscriptions.set(tenantId, newSub);
      return newSub;
    }
  }

  // Webhook Idempotency
  async checkAndRecordWebhookEvent(
    provider: string,
    externalEventId: string,
    eventType: string,
    payload: unknown
  ): Promise<{ isDuplicate: boolean; eventId: string }> {
    const key = `${provider}:${externalEventId}`;
    const existing = this.webhookEvents.get(key);
    if (existing) {
      return { isDuplicate: true, eventId: existing.id };
    }
    const eventId = generateId();
    this.webhookEvents.set(key, {
      id: eventId,
      provider,
      externalEventId,
      status: 'received',
    });
    return { isDuplicate: false, eventId };
  }

  async markWebhookProcessed(eventId: string, errorMessage?: string): Promise<void> {
    for (const event of this.webhookEvents.values()) {
      if (event.id === eventId) {
        event.status = errorMessage ? 'failed' : 'processed';
        event.processedAt = new Date().toISOString();
        event.error = errorMessage;
        break;
      }
    }
  }

  // Audit Events
  async recordAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<AuditEvent> {
    const newEvent: AuditEvent = {
      ...event,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.auditEvents.push(newEvent);
    return { ...newEvent };
  }

  async listAuditEvents(tenantId: string, limit = 50): Promise<AuditEvent[]> {
    return this.auditEvents
      .filter((e) => e.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

/**
 * Callivaan Web API Client
 */
import {
  User,
  Tenant,
  BusinessProfile,
  AgentConfigVersion,
  AgentSettings,
  PhoneRoute,
  Call,
  CallSummary,
  WhatsAppLink,
  UsageLedger,
  Subscription,
  PlanDefinition,
} from '@callivaan/shared';

const API_BASE = '/v1';

class ApiClient {
  private token: string | null = null;
  private tenantId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('callivaan_token');
    this.tenantId = localStorage.getItem('callivaan_tenant_id');
  }

  public setAuth(token: string, tenantId: string) {
    this.token = token;
    this.tenantId = tenantId;
    localStorage.setItem('callivaan_token', token);
    localStorage.setItem('callivaan_tenant_id', tenantId);
  }

  public clearAuth() {
    this.token = null;
    this.tenantId = null;
    localStorage.removeItem('callivaan_token');
    localStorage.removeItem('callivaan_tenant_id');
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-correlation-id': 'web_' + Math.random().toString(36).substring(2, 9),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.tenantId) {
      headers['x-tenant-id'] = this.tenantId;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.clearAuth();
      window.dispatchEvent(new Event('auth_expired'));
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  // Auth
  async signup(data: { email: string; password: string; fullName: string; businessName: string; category: string; phoneNumber?: string }) {
    return this.request<{ user: User; tenant: Tenant; accessToken: string; refreshToken: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: User; tenant: Tenant; role: string; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: User; tenant: Tenant; role: string }>('/auth/me');
  }

  // Tenant & Profile
  async getProfile() {
    return this.request<BusinessProfile>('/tenant/profile');
  }

  async updateProfile(updates: Partial<BusinessProfile>) {
    return this.request<BusinessProfile>('/tenant/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Agent Config
  async getActiveConfig() {
    return this.request<AgentConfigVersion>('/agent-configs/active');
  }

  async getAgentVersions() {
    return this.request<{ versions: AgentConfigVersion[] }>('/agent-configs');
  }

  async createAgentVersion(settings: AgentSettings, changeNote?: string, activateImmediately = true) {
    return this.request<AgentConfigVersion>('/agent-configs', {
      method: 'POST',
      body: JSON.stringify({ settings, changeNote, activateImmediately }),
    });
  }

  async activateAgentVersion(id: string) {
    return this.request<AgentConfigVersion>(`/agent-configs/${id}/activate`, {
      method: 'POST',
    });
  }

  async getPresets() {
    return this.request<{ presets: Record<string, { label: string; settings: AgentSettings }> }>('/agent-configs/presets');
  }

  // Telephony Route
  async getRoute() {
    return this.request<PhoneRoute>('/telephony/route');
  }

  async updateRoute(updates: Partial<PhoneRoute>) {
    return this.request<PhoneRoute>('/telephony/route', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async triggerTestCall(callerNumber?: string) {
    return this.request<{ message: string; call: Call; summary: CallSummary }>('/telephony/route/test-call', {
      method: 'POST',
      body: JSON.stringify({ callerNumber }),
    });
  }

  // WhatsApp
  async getWhatsAppStatus() {
    return this.request<{ isLinked: boolean; link: WhatsAppLink | null }>('/whatsapp/status');
  }

  async requestPairingCode(whatsappPhoneNumber: string) {
    return this.request<{ pairingCode: string; expiresAt: string; instruction: string }>('/whatsapp/pairing-code', {
      method: 'POST',
      body: JSON.stringify({ whatsappPhoneNumber }),
    });
  }

  async verifyPairing(pairingCode: string, whatsappPhoneNumber: string) {
    return this.request<{ message: string; link: WhatsAppLink }>('/whatsapp/verify', {
      method: 'POST',
      body: JSON.stringify({ pairingCode, whatsappPhoneNumber }),
    });
  }

  async updateWhatsAppOptIns(optIns: { callSummaries?: boolean; urgentAlerts?: boolean; productUpdates?: boolean }) {
    return this.request<WhatsAppLink>('/whatsapp/opt-ins', {
      method: 'PATCH',
      body: JSON.stringify(optIns),
    });
  }

  // Calls
  async listCalls(limit = 20, offset = 0) {
    return this.request<{ calls: (Call & { summary: CallSummary | null })[]; total: number }>(`/calls?limit=${limit}&offset=${offset}`);
  }

  async getCallDetails(id: string) {
    return this.request<{ call: Call; summary: CallSummary | null; agentConfigVersion: AgentConfigVersion | null }>(`/calls/${id}`);
  }

  async deleteCall(id: string) {
    return this.request<{ message: string }>(`/calls/${id}`, {
      method: 'DELETE',
    });
  }

  // Usage & Billing
  async getCurrentUsage() {
    return this.request<{
      period: string;
      plan: { id: string; name: string; includedMinutes: number; overageRatePerMinuteInr: number };
      subscriptionStatus: string;
      usage: {
        telephonyMinutesUsed: number;
        aiUnitsUsed: number;
        whatsappMessagesSent: number;
        includedMinutes: number;
        remainingMinutes: number;
        overageMinutes: number;
        estimatedOverageCostInr: number;
        percentUsed: number;
        isWarningThreshold: boolean;
        isHardLimitReached: boolean;
        isLimitExceeded: boolean;
      };
    }>('/usage/current');
  }

  async getPlans() {
    return this.request<{ plans: PlanDefinition[] }>('/billing/plans');
  }

  async getSubscription() {
    return this.request<{ subscription: Subscription; plan: PlanDefinition }>('/billing/subscription');
  }

  async createCheckout(planId: string, billingCycle = 'monthly') {
    return this.request<{
      orderId: string;
      planId: string;
      planName: string;
      amountInr: number;
      currency: string;
      checkoutUrl: string;
    }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle }),
    });
  }

  async activatePlanDemo(planId: string) {
    return this.request<{ message: string; subscription: Subscription }>('/billing/activate-plan-demo', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }
}

export const api = new ApiClient();

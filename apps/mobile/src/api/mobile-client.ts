/**
 * Callivaan Mobile API Client
 * Securely communicates with the backend API.
 * Contains ZERO service secrets or provider credentials.
 */
import {
  User,
  Tenant,
  AgentConfigVersion,
  AgentSettings,
  PhoneRoute,
  Call,
  CallSummary,
  WhatsAppLink,
  UsageLedger,
} from '@callivaan/shared';

export class MobileApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tenantId: string | null = null;

  constructor(baseUrl = 'http://localhost:4000/v1') {
    this.baseUrl = baseUrl;
  }

  public setToken(token: string, tenantId: string) {
    this.token = token;
    this.tenantId = tenantId;
  }

  public clearToken() {
    this.token = null;
    this.tenantId = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-correlation-id': 'mobile_' + Math.random().toString(36).substring(2, 9),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.tenantId) {
      headers['x-tenant-id'] = this.tenantId;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async login(email: string, password: string) {
    const res = await this.request<{
      user: User;
      tenant: Tenant;
      role: string;
      accessToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken, res.tenant.id);
    return res;
  }

  async getActiveConfig() {
    return this.request<AgentConfigVersion>('/agent-configs/active');
  }

  async listCalls(limit = 20) {
    return this.request<{ calls: (Call & { summary: CallSummary | null })[]; total: number }>(`/calls?limit=${limit}`);
  }

  async getRoute() {
    return this.request<PhoneRoute>('/telephony/route');
  }

  async getWhatsAppStatus() {
    return this.request<{ isLinked: boolean; link: WhatsAppLink | null }>('/whatsapp/status');
  }

  async requestPairingCode(whatsappPhoneNumber: string) {
    return this.request<{ pairingCode: string; expiresAt: string; instruction: string }>('/whatsapp/pairing-code', {
      method: 'POST',
      body: JSON.stringify({ whatsappPhoneNumber }),
    });
  }

  async getUsage() {
    return this.request<{
      period: string;
      plan: { name: string; includedMinutes: number };
      usage: { telephonyMinutesUsed: number; remainingMinutes: number; percentUsed: number };
    }>('/usage/current');
  }

  async triggerTestCall() {
    return this.request<{ message: string; call: Call; summary: CallSummary }>('/telephony/route/test-call', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }
}

export const mobileApi = new MobileApiClient();

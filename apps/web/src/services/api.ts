/**
 * Callivaan Web API Client
 * Connects to Callivaan API (/v1) with automatic JWT token & tenant header injection.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/v1';

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
}

export interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export interface AuthResponse {
  message: string;
  user: ApiUser;
  tenant: ApiTenant;
  role: string;
  accessToken: string;
  refreshToken: string;
  availableTenants?: { id: string; name: string; role: string }[];
}

export interface CallItem {
  id: string;
  callerNumber: string;
  virtualNumber: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  status: 'completed' | 'in_progress' | 'callback_requested' | 'human_fallback' | 'technical_failure';
  costEstimateInr?: number;
  summary?: {
    id: string;
    summaryText: string;
    extractedLead?: {
      callerName?: string;
      callbackNumber?: string;
      requestedService?: string;
      preferredTime?: string;
      urgency?: string;
      followUpAction?: string;
    };
    deliveryStatus?: string;
  } | null;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('callivaan_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const tenantId = localStorage.getItem('callivaan_tenant_id');
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers as any),
      },
    });

    if (!res.ok) {
      let errorMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.message || errorJson.title || errorJson.error || errorMsg;
      } catch {
        // fallback to status text
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Auth Endpoints
  public auth = {
    signup: (data: {
      email: string;
      password: string;
      fullName: string;
      businessName: string;
      category?: string;
      phoneNumber?: string;
    }) => this.request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    getMe: () =>
      this.request<{ user: ApiUser; tenant: ApiTenant; role: string }>('/auth/me', { method: 'GET' }),
  };

  // Agent Config Endpoints
  public agent = {
    getActive: () => this.request<any>('/agent-configs/active', { method: 'GET' }),
    getPresets: () => this.request<{ presets: Record<string, any> }>('/agent-configs/presets', { method: 'GET' }),
    listVersions: () => this.request<{ versions: any[] }>('/agent-configs', { method: 'GET' }),
    updateConfig: (settings: any, changeNote?: string) =>
      this.request<any>('/agent-configs', {
        method: 'POST',
        body: JSON.stringify({ settings, changeNote, activateImmediately: true }),
      }),
    activateVersion: (versionId: string) =>
      this.request<any>(`/agent-configs/${versionId}/activate`, { method: 'POST' }),
  };

  // Telephony Routing Endpoints
  public telephony = {
    getRoute: () => this.request<any>('/telephony/route', { method: 'GET' }),
    updateRoute: (data: any) => this.request<any>('/telephony/route', { method: 'PATCH', body: JSON.stringify(data) }),
    triggerTestCall: (callerNumber?: string) =>
      this.request<{ message: string; call: any; summary: any }>('/telephony/test-call', {
        method: 'POST',
        body: JSON.stringify({ callerNumber }),
      }),
  };

  // WhatsApp Hub Endpoints
  public whatsapp = {
    getStatus: () => this.request<{ isLinked: boolean; link: any | null }>('/whatsapp/status', { method: 'GET' }),
    requestPairingCode: (whatsappPhoneNumber: string) =>
      this.request<{ pairingCode: string; whatsappPhoneNumber: string; expiresAt: string; instruction: string }>(
        '/whatsapp/pairing-code',
        { method: 'POST', body: JSON.stringify({ whatsappPhoneNumber }) }
      ),
    verifyPairing: (pairingCode: string, whatsappPhoneNumber: string) =>
      this.request<{ message: string; link: any }>('/whatsapp/verify', {
        method: 'POST',
        body: JSON.stringify({ pairingCode, whatsappPhoneNumber }),
      }),
    updateOptIns: (optIns: { callSummaries?: boolean; urgentAlerts?: boolean; productUpdates?: boolean }) =>
      this.request<any>('/whatsapp/opt-ins', { method: 'PATCH', body: JSON.stringify(optIns) }),
  };

  // Calls Feed & Details Endpoints
  public calls = {
    listCalls: (limit: number = 20, offset: number = 0) =>
      this.request<{ calls: CallItem[]; total: number; limit: number; offset: number }>(
        `/calls?limit=${limit}&offset=${offset}`,
        { method: 'GET' }
      ),
    getCallDetails: (callId: string) =>
      this.request<{ call: CallItem; summary: any | null; agentConfigVersion: any | null }>(`/calls/${callId}`, {
        method: 'GET',
      }),
    deleteCall: (callId: string) =>
      this.request<{ message: string }>(`/calls/${callId}`, { method: 'DELETE' }),
  };

  // Usage & Billing Endpoints
  public billing = {
    getCurrentUsage: () => this.request<any>('/usage/current', { method: 'GET' }),
    getSubscription: () => this.request<any>('/billing/subscription', { method: 'GET' }),
    getPlans: () => this.request<{ plans: any[] }>('/billing/plans', { method: 'GET' }),
    createCheckout: (planId: string, billingCycle: 'monthly' | 'annual' = 'monthly') =>
      this.request<any>('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle }),
      }),
  };

  // Tenant Profile Endpoints
  public tenant = {
    getProfile: () => this.request<any>('/tenant/profile', { method: 'GET' }),
    updateProfile: (data: any) => this.request<any>('/tenant/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  };
}

export const api = new ApiClient();
